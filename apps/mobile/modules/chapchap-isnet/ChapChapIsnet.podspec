Pod::Spec.new do |s|
  s.name = 'ChapChapIsnet'
  s.version = '1.0.0'
  s.summary = 'On-device ISNet background removal for ChapChap'
  s.description = s.summary
  s.license = { :type => 'MIT' }
  s.author = 'ChapChap'
  s.homepage = 'https://chapchap.kr'
  s.platforms = { :ios => '16.4' }
  s.source = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'onnxruntime-objc', '1.23.0'
  s.source_files = 'ios/**/*.swift'
  s.resource_bundles = { 'ChapChapIsnetModels' => ['models/*.onnx', 'models/*LICENSE.txt'] }
  s.frameworks = 'UIKit', 'ImageIO', 'CoreML'
  s.swift_version = '6.0'
  # Keep per-pixel preprocessing fast in development builds as well.
  s.pod_target_xcconfig = { 'SWIFT_OPTIMIZATION_LEVEL' => '-O' }
end
