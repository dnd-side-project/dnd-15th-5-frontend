import Foundation
import ImageIO
import UIKit

func isnetFailure(_ message: String) -> NSError {
  NSError(domain: "ChapChapIsnet", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
}

// Image validation and pixel math do not depend on Expo or ONNX session state.
enum IsnetImageProcessor {
  static let inputSize = 1024
  private static let maxImageEdge = 1536
  private static let maxBase64Length = 16 * 1024 * 1024

  static func makeEmptyInput() throws -> NSMutableData {
    guard let data = NSMutableData(length: 3 * inputSize * inputSize * MemoryLayout<Float>.size) else {
      throw isnetFailure("ISNet 입력 메모리를 준비하지 못했어요.")
    }
    return data
  }

  static func decode(_ base64: String) throws -> CGImage {
    guard base64.utf8.count <= maxBase64Length, let data = Data(base64Encoded: base64),
      let source = CGImageSourceCreateWithData(data as CFData, nil), CGImageSourceGetCount(source) == 1,
      CGImageSourceGetType(source) as String? == "public.png",
      let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
      let width = properties[kCGImagePropertyPixelWidth] as? Int,
      let height = properties[kCGImagePropertyPixelHeight] as? Int,
      width > 0, height > 0, width <= maxImageEdge, height <= maxImageEdge,
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
      throw isnetFailure("사진 크기나 형식이 올바르지 않아요.")
    }
    return image
  }

  static func makeInput(_ image: CGImage) throws -> NSMutableData {
    let small = try rgba(image, width: inputSize, height: inputSize)
    let count = inputSize * inputSize
    let input = try makeEmptyInput()
    let values = input.mutableBytes.bindMemory(to: Float.self, capacity: count * 3)
    for index in 0..<count {
      let offset = index * 4
      let alpha = Float(small[offset + 3])
      values[index] = (alpha > 0 ? Float(small[offset]) / alpha : 0) - 0.5
      values[count + index] = (alpha > 0 ? Float(small[offset + 1]) / alpha : 0) - 0.5
      values[count * 2 + index] = (alpha > 0 ? Float(small[offset + 2]) / alpha : 0) - 0.5
    }
    return input
  }

  static func encodeForeground(
    _ prediction: [Float], image: CGImage, checkCancelled: () throws -> Void
  ) throws -> String {
    let width = image.width
    let height = image.height
    var minimum = Float.infinity
    var maximum = -Float.infinity
    for value in prediction {
      guard value.isFinite else { throw isnetFailure("ISNet 마스크를 읽지 못했어요.") }
      minimum = min(minimum, value)
      maximum = max(maximum, value)
    }
    let range = maximum - minimum
    let mask = prediction.map { value -> UInt8 in
      let alpha = range > 0 ? (value - minimum) / range : value
      return UInt8((min(1, max(0, alpha)) * 255).rounded())
    }
    guard let provider = CGDataProvider(data: Data(mask) as CFData),
      let maskImage = CGImage(width: inputSize, height: inputSize, bitsPerComponent: 8, bitsPerPixel: 8,
        bytesPerRow: inputSize, space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGBitmapInfo(rawValue: 0),
        provider: provider, decode: nil, shouldInterpolate: true, intent: .defaultIntent) else {
      throw isnetFailure("마스크 이미지를 만들지 못했어요.")
    }
    var scaledMask = [UInt8](repeating: 0, count: width * height)
    let rendered = scaledMask.withUnsafeMutableBytes { buffer -> Bool in
      guard let context = CGContext(data: buffer.baseAddress, width: width, height: height,
        bitsPerComponent: 8, bytesPerRow: width, space: CGColorSpaceCreateDeviceGray(), bitmapInfo: 0) else { return false }
      context.interpolationQuality = .high
      context.draw(maskImage, in: CGRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height)))
      return true
    }
    if !rendered { throw isnetFailure("마스크를 적용하지 못했어요.") }
    var pixels = try rgba(image, width: width, height: height)
    for index in 0..<(width * height) {
      for channel in 0..<4 {
        pixels[index * 4 + channel] = UInt8((Int(pixels[index * 4 + channel]) * Int(scaledMask[index]) + 127) / 255)
      }
    }
    try checkCancelled()
    guard let pixelProvider = CGDataProvider(data: Data(pixels) as CFData),
      let result = CGImage(width: width, height: height, bitsPerComponent: 8, bitsPerPixel: 32,
        bytesPerRow: width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
        bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue),
        provider: pixelProvider, decode: nil, shouldInterpolate: true, intent: .defaultIntent),
      let png = UIImage(cgImage: result).pngData() else { throw isnetFailure("PNG를 만들지 못했어요.") }
    let encoded = png.base64EncodedString()
    if encoded.utf8.count > maxBase64Length { throw isnetFailure("처리한 사진이 너무 커요.") }
    return encoded
  }

  private static func rgba(_ image: CGImage, width: Int, height: Int) throws -> [UInt8] {
    var pixels = [UInt8](repeating: 0, count: width * height * 4)
    let ok = pixels.withUnsafeMutableBytes { buffer -> Bool in
      guard let context = CGContext(data: buffer.baseAddress, width: width, height: height,
        bitsPerComponent: 8, bytesPerRow: width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue) else { return false }
      context.interpolationQuality = .high
      context.draw(image, in: CGRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height)))
      return true
    }
    if !ok { throw isnetFailure("사진을 읽지 못했어요.") }
    return pixels
  }
}
