//
//  PoseLandmarkerHolder.swift
//  movement
//
//  Created by Ailson Freire on 13/03/25.
//

import MediaPipeTasksVision

class PoseLandmarkerHolder {
  static let shared = PoseLandmarkerHolder()

  private(set) var poseLandmarker: PoseLandmarker?

  private init() {}

  func initializePoseLandmarker(with options: PoseLandmarkerOptions) throws {
    self.poseLandmarker = try PoseLandmarker(options: options)
  }

  func clearPoseLandmarker() {
    self.poseLandmarker = nil
  }

  func getPoseLandmarker() -> PoseLandmarker? {
    return self.poseLandmarker
  }
}
