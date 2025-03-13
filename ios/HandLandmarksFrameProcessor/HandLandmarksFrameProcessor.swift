import VisionCamera
import MediaPipeTasksVision

@objc(HandLandmarksFrameProcessorPlugin)
public class HandLandmarksFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    let buffer = frame.buffer
    
    
    
    
    if let handLandmarker = HandLandmarkerHolder.shared.getHandLandmarker() {
        // Use the handLandmarker instance
      do {
        let image = try MPImage(sampleBuffer: buffer, orientation: frame.orientation)
        try handLandmarker.detectAsync(image: image, timestampInMilliseconds:Int(frame.timestamp))
        return "Frame processed successfully"
      } catch {
        return nil
      }
    } else {
        print("HandLandmarker is not initialized.")
      return nil
    }


  }
}
