import { Skia } from "@shopify/react-native-skia";
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
import { useSharedValue } from "react-native-worklets-core";

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

type KeypointData = {
	keypoint: number;
	x: number;
	y: number;
	z: number;
	visibility: number;
	presence: number;
};

type KeypointsMap = { [key: string]: KeypointData };
const LINES = [
	[0, 1],
	[0, 4],
	[1, 2],
	[2, 3],
	[3, 7],
	[4, 5],
	[5, 6],
	[6, 8],
	[9, 10],
	[11, 12],
	[11, 13],
	[11, 23],
	[12, 14],
	[12, 24],
	[13, 15],
	[15, 17],
	[15, 19],
	[15, 21],
	[17, 19],
	[14, 16],
	[16, 18],
	[16, 20],
	[16, 22],
	[18, 20],
	[23, 24],
	[23, 25],
	[24, 26],
	[25, 27],
	[26, 28],
	[27, 29],
	[27, 31],
	[29, 31],
	[28, 30],
	[28, 32],
	[30, 32],
];
const linePaint = Skia.Paint();
linePaint.setColor(Skia.Color("red"));
linePaint.setStrokeWidth(30);

const circlePaint = Skia.Paint();
circlePaint.setColor(Skia.Color("green"));
linePaint.setStrokeWidth(10);

export default function Exercise() {
	const landmarks = useSharedValue<KeypointsMap>({});
	const device = useCameraDevice("front");
	const { hasPermission, requestPermission } = useCameraPermission();

	useEffect(() => {
		// Set up the event listener to listen for pose landmarks detection results
		const subscription = poseLandmarksEmitter.addListener(
			"onPoseLandmarksDetected",
			(event) => {
				// Update the landmarks shared value to paint them on the screen

				/*
          The event contains values for landmarks and pose.
          These values are defined in the PoseLandmarkerResultProcessor class
          found in the PoseLandmarks.swift file.
        */
				landmarks.value = event.landmarks[0];
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

		// Process the frame using the 'poseLandmarks' function
		poseLandmarks(frame);
		frame.render();
		if (landmarks.value != null && Object.keys(landmarks.value).length > 0) {
			let body = landmarks.value;
			let frameWidth = frame.width;
			let frameHeight = frame.height;
			// Draw line on landmarks
			for (let [from, to] of LINES) {
				frame.drawLine(
					body[from].x * Number(frameWidth),
					body[from].y * Number(frameHeight),
					body[to].x * Number(frameWidth),
					body[to].y * Number(frameHeight),
					linePaint
				);
			}
			// Draw circles on landmarks
			for (let mark of Object.values(body)) {
				frame.drawCircle(
					mark.x * Number(frameWidth),
					mark.y * Number(frameHeight),
					6,
					circlePaint
				);
			}
		}

		landmarks.value = {};
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
