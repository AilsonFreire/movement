//
//  HandLandmarks.swift
//  movement
//
//  Created by Ailson Freire on 12/03/25.
//

import Foundation
import React
import MediaPipeTasksVision

class HandLandmarkerResultProcessor: NSObject, HandLandmarkerLiveStreamDelegate {

    weak var eventEmitter: RCTEventEmitter?

    init(eventEmitter: RCTEventEmitter) {
        self.eventEmitter = eventEmitter
    }

    func handLandmarker(
        _ handLandmarker: HandLandmarker,
        didFinishDetection result: HandLandmarkerResult?,
        timestampInMilliseconds: Int,
        error: Error?) {

          if let error = error {
            print("Error: \(error.localizedDescription)")
            eventEmitter?.sendEvent(withName: "onHandLandmarksError", body: ["error": error.localizedDescription])
            return
          }

          guard let result = result else {
            print("No result received.")
            return
          }

          // Prepare the data to be sent back to JavaScript
          let landmarksArray = NSMutableArray()

          for handLandmarks in result.landmarks {
            let handArray = NSMutableArray()
            for (index, handmark) in handLandmarks.enumerated() {
              let landmarkMap = NSMutableDictionary()
              landmarkMap["keypoint"] = index
              landmarkMap["x"] = handmark.x
              landmarkMap["y"] = handmark.y
              landmarkMap["z"] = handmark.z
              handArray.add(landmarkMap)
            }
            landmarksArray.add(handArray)
          }

          var handName = ""
          for hand in result.handedness {
            for (_, handProps) in hand.enumerated() {
              handName = handProps.categoryName ?? "Unknown"
            }
          }

          print("Hand landmarks detected: \(landmarksArray)")

          let params: [String: Any] = ["landmarks": landmarksArray, "hand": handName]
        eventEmitter?.sendEvent(withName: "onHandLandmarksDetected", body: params)
    }
}

@objc(HandLandmarks)
class HandLandmarks: RCTEventEmitter {

    private var resultProcessor: HandLandmarkerResultProcessor?

    override init() {
        super.init()
        initModel()
    }


    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return ["onHandLandmarksDetected", "onHandLandmarksStatus", "onHandLandmarksError"]
    }

    @objc
    func initModel() {
        do {
            // Initialize the result processor and set it as the delegate
            resultProcessor = HandLandmarkerResultProcessor(eventEmitter: self)

            // Initialize the Hand Landmarker
            let modelPath = Bundle.main.path(forResource: "hand_landmarker", ofType: "task")

            let options = HandLandmarkerOptions()
            options.baseOptions.modelAssetPath = modelPath ?? "hand_landmarker.task"
            options.runningMode = .liveStream
            options.numHands = 1
            options.handLandmarkerLiveStreamDelegate = resultProcessor

            try HandLandmarkerHolder.shared.initializeHandLandmarker(with: options)

            // Send success event to JS
            print("HandLandmarker initialized")
        } catch {
            print("Error initializing HandLandmarker: \(error.localizedDescription)")
        }
    }

    private func sendErrorEvent(_ error: String) {
        let errorParams: [String: Any] = ["error": error]
        sendEvent(withName: "onHandLandmarksError", body: errorParams)
    }
}
