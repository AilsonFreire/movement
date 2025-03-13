#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("poseLandmarks/poseLandmarks-Swift.h")
#import "poseLandmarks/poseLandmarks-Swift.h"
#else
#import "movement-Swift.h"
#endif

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(PoseLandmarksFrameProcessorPlugin, poseLandmarks)
