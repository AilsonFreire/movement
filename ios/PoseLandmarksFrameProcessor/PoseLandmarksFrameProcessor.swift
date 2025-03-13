import VisionCamera
import MediaPipeTasksVision

@objc(PoseLandmarksFrameProcessorPlugin)
public class PoseLandmarksFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    let buffer = frame.buffer

    if let poseLandmarker = PoseLandmarkerHolder.shared.getPoseLandmarker() {

      do {
        /*
         The MPImage class from MediaPipeTasksVision is used to create an image object
         from the frame buffer
         .*/
        let image = try MPImage(sampleBuffer: buffer, orientation: frame.orientation)
        try poseLandmarker.detectAsync(image: image, timestampInMilliseconds: Int(frame.timestamp))
        return "Frame processed successfully"
      } catch {
        return nil
      }
    } else {
        print("PoseLandmarker is not initialized.")
        return nil
    }
  }
}
