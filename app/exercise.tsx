import React, { useEffect } from "react";
import {
	NativeEventEmitter,
	NativeModules,
	Platform,
	StyleSheet,
	Text,
} from "react-native";
import {
	Camera,
	Frame,
	useCameraDevice,
	useCameraPermission,
	useSkiaFrameProcessor,
	VisionCameraProxy,
} from "react-native-vision-camera";

const { PoseLandmarks } = NativeModules;

const poseLandmarksEmitter = new NativeEventEmitter(PoseLandmarks);

// Initialize the frame processor plugin 'poseLandmarks'
const poseLandMarkPlugin = VisionCameraProxy.initFrameProcessorPlugin(
	"poseLandmarks",
	{}
);

function poseLandmarks(frame: Frame) {
	"worklet";
	if (poseLandMarkPlugin == null) {
		throw new Error("Failed to load Frame Processor Plugin!");
	}
	return poseLandMarkPlugin.call(frame);
}

export default function Exercise() {
	const device = useCameraDevice("front");
	const { hasPermission, requestPermission } = useCameraPermission();

	useEffect(() => {
		// Set up the event listener to listen for hand landmarks detection results
		const subscription = poseLandmarksEmitter.addListener(
			"onPoseLandmarksDetected",
			(event) => {
				// Update the landmarks shared value to paint them on the screen

				/*
          The event contains values for landmarks and hand.
          These values are defined in the HandLandmarkerResultProcessor class
          found in the HandLandmarks.swift file.
        */
				console.log("onPoseLandmarksDetected: ", event);

				/*
          This is where you can handle converting the data into commands
          for further processing.
        */
			}
		);

		// Clean up the event listener when the component is unmounted
		return () => {
			subscription.remove();
		};
	}, []);

	useEffect(() => {
		requestPermission().catch((error) => console.log(error));
	}, [requestPermission]);

	const frameProcessor = useSkiaFrameProcessor((frame) => {
		"worklet";
		frame.render();

		// Process the frame using the 'handLandmarks' function
		poseLandmarks(frame);
	}, []);

	if (!hasPermission) {
		return <Text>No permission</Text>;
	}

	if (device == null) {
		return <Text>No device</Text>;
	}

	const pixelFormat = Platform.OS === "ios" ? "rgb" : "yuv";

	return (
		<Camera
			style={StyleSheet.absoluteFill}
			device={device}
			isActive={true}
			frameProcessor={frameProcessor}
			pixelFormat={pixelFormat}
		/>
	);
}
