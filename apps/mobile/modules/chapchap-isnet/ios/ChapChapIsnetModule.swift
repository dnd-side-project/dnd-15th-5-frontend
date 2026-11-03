import ExpoModulesCore
import Foundation
import onnxruntime_objc

private let inputSize = IsnetImageProcessor.inputSize

// Model state is confined to queue; cancellation state is protected by lock.
public final class ChapChapIsnetModule: Module, @unchecked Sendable {
  private let queue = DispatchQueue(label: "kr.chapchap.isnet", qos: .userInitiated)
  private let lock = NSLock()
  private var activeId: String?
  private var isCancelled = false
  private var environment: ORTEnv?
  private var session: ORTSession?
  private var backend = "cpu"
  private var coreMLDisabled = false

  public func definition() -> ModuleDefinition {
    Name("ChapChapIsnet")
    AsyncFunction("prepare") { () -> String in
      try self.prepare()
      return self.backend
    }.runOnQueue(queue)
    AsyncFunction("remove") { (requestId: String, base64: String) -> [String: Any] in
      try self.remove(requestId: requestId, base64: base64)
    }.runOnQueue(queue)
    Function("cancel") { (requestId: String) in
      self.lock.lock()
      if self.activeId == requestId { self.isCancelled = true }
      self.lock.unlock()
    }
    OnDestroy {
      self.queue.async { self.session = nil; self.environment = nil }
    }
  }

  private func checkCancelled() throws {
    lock.lock()
    let cancelled = isCancelled
    lock.unlock()
    if cancelled { throw isnetFailure("사진 처리를 취소했어요.") }
  }

  private func modelURL() throws -> URL {
    let bundleURL = Bundle.main.url(forResource: "ChapChapIsnetModels", withExtension: "bundle")
      ?? Bundle(for: ChapChapIsnetModule.self).url(forResource: "ChapChapIsnetModels", withExtension: "bundle")
    guard let url = bundleURL, let bundle = Bundle(url: url),
      let model = bundle.url(forResource: "isnet-general-use", withExtension: "onnx") else {
      throw isnetFailure("ISNet 모델이 앱에 포함되지 않았어요. 모델 준비 후 앱을 다시 빌드해주세요.")
    }
    return model
  }

  private func createSession(useCoreML: Bool) throws {
    let env = try environment ?? ORTEnv(loggingLevel: .warning)
    environment = env
    let options = try ORTSessionOptions()
    try options.setIntraOpNumThreads(Int32(min(4, ProcessInfo.processInfo.activeProcessorCount)))
    try options.setGraphOptimizationLevel(.all)
    if useCoreML {
      let cache = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        .appendingPathComponent("chapchap-isnet-coreml-fc16ebd8")
      try FileManager.default.createDirectory(at: cache, withIntermediateDirectories: true)
      try options.appendCoreMLExecutionProvider(withOptionsV2: [
        "MLComputeUnits": "ALL", "ModelFormat": "MLProgram",
        "RequireStaticInputShapes": "1", "ModelCacheDirectory": cache.path
      ])
    }
    session = try ORTSession(env: env, modelPath: modelURL().path, sessionOptions: options)
    backend = useCoreML ? "coreml" : "cpu"
  }

  private func prepare() throws {
    if session != nil { return }
    let useCoreML = !coreMLDisabled && ORTIsCoreMLExecutionProviderAvailable()
    do {
      try createSession(useCoreML: useCoreML)
      _ = try predict(IsnetImageProcessor.makeEmptyInput())
    } catch {
      if !useCoreML { session = nil; throw error }
      try activateCpuSession()
      do {
        _ = try predict(IsnetImageProcessor.makeEmptyInput())
      } catch { session = nil; throw error }
    }
  }

  private func activateCpuSession() throws {
    session = nil
    coreMLDisabled = true
    try createSession(useCoreML: false)
  }

  private func predict(_ data: NSMutableData) throws -> [Float] {
    guard let session = session, let inputName = try session.inputNames().first,
      let outputName = try session.outputNames().first else { throw isnetFailure("ISNet 세션을 준비하지 못했어요.") }
    let input = try ORTValue(tensorData: data, elementType: .float,
                            shape: [1, 3, NSNumber(value: inputSize), NSNumber(value: inputSize)])
    let outputs = try session.run(withInputs: [inputName: input], outputNames: [outputName], runOptions: nil)
    guard let output = outputs[outputName] else { throw isnetFailure("ISNet 결과가 없어요.") }
    let info = try output.tensorTypeAndShapeInfo()
    guard info.elementType == .float, info.shape.map({ $0.intValue }) == [1, 1, inputSize, inputSize] else {
      throw isnetFailure("ISNet 마스크 형식이 올바르지 않아요.")
    }
    let bytes = try output.tensorData()
    guard bytes.length == inputSize * inputSize * MemoryLayout<Float>.size else {
      throw isnetFailure("ISNet 마스크 크기가 올바르지 않아요.")
    }
    return Array(UnsafeBufferPointer(start: bytes.bytes.assumingMemoryBound(to: Float.self),
                                    count: inputSize * inputSize))
  }

  private func remove(requestId: String, base64: String) throws -> [String: Any] {
    try prepare()
    lock.lock(); activeId = requestId; isCancelled = false; lock.unlock()
    defer { lock.lock(); activeId = nil; isCancelled = false; lock.unlock() }
    try checkCancelled()
    let started = ProcessInfo.processInfo.systemUptime
    let image = try IsnetImageProcessor.decode(base64)
    let input = try IsnetImageProcessor.makeInput(image)
    try checkCancelled()
    let prediction: [Float]
    do { prediction = try predict(input) } catch {
      try checkCancelled()
      if backend != "coreml" { throw error }
      try activateCpuSession()
      prediction = try predict(input)
    }
    try checkCancelled()
    let encoded = try IsnetImageProcessor.encodeForeground(
      prediction, image: image, checkCancelled: self.checkCancelled
    )
    return ["base64": encoded, "mimeType": "image/png", "backend": backend,
            "elapsedMs": (ProcessInfo.processInfo.systemUptime - started) * 1000]
  }
}
