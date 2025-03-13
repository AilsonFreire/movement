//
//  HandLandmarkerHolder.swift
//  movement
//
//  Created by Ailson Freire on 12/03/25.
//

import MediaPipeTasksVision

class HandLandmarkerHolder {
    static let shared = HandLandmarkerHolder()
    
    private(set) var handLandmarker: HandLandmarker?
    
    private init() {} // Private initializer to enforce singleton pattern
    
    func initializeHandLandmarker(with options: HandLandmarkerOptions) throws {
        self.handLandmarker = try HandLandmarker(options: options)
    }
    
    func clearHandLandmarker() {
        self.handLandmarker = nil
    }
    
    func getHandLandmarker() -> HandLandmarker? {
        return self.handLandmarker
    }
}
