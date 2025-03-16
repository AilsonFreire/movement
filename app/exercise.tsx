import React, { useEffect, useRef } from "react";
import {
	Platform,
	StyleSheet,
	Text,
	NativeModules,
	NativeEventEmitter,
} from "react-native";
import {
	Camera,
	Frame,
	useCameraDevice,
	useCameraPermission,
	useFrameProcessor,
	useSkiaFrameProcessor,
	VisionCameraProxy,
} from "react-native-vision-camera";
import { Skia } from "@shopify/react-native-skia";
import { useSharedValue } from "react-native-worklets-core";

const { HandLandmarks } = NativeModules;

const handLandmarksEmitter = new NativeEventEmitter(HandLandmarks);

// Initialize the frame processor plugin 'handLandmarks'
const handLandMarkPlugin = VisionCameraProxy.initFrameProcessorPlugin(
	"handLandmarks",
	{}
);

// Create a worklet function 'handLandmarks' that will call the plugin function
function handLandmarks(frame: Frame) {
	"worklet";
	if (handLandMarkPlugin == null) {
		throw new Error("Failed to load Frame Processor Plugin!");
	}
	return handLandMarkPlugin.call(frame);
}

const lines = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	[0, 5],
	[5, 6],
	[6, 7],
	[7, 8],
	[5, 9],
	[9, 10],
	[10, 11],
	[11, 12],
	[9, 13],
	[13, 14],
	[14, 15],
	[15, 16],
	[13, 17],
	[0, 17],
	[17, 18],
	[18, 19],
	[19, 20],
];

type KeypointData = {
	keypoint: number;
	x: number;
	y: number;
	z: number;
};

type KeypointsMap = { [key: string]: KeypointData };

export default function Exercise() {
	const linePaint = Skia.Paint();
	linePaint.setColor(Skia.Color("red"));
	linePaint.setStrokeWidth(30);

	const circlePaint = Skia.Paint();
	circlePaint.setColor(Skia.Color("green"));
	linePaint.setStrokeWidth(10);

	const landmarks = useSharedValue<KeypointsMap>({});
	const device = useCameraDevice("front");
	const { hasPermission, requestPermission } = useCameraPermission();

	useEffect(() => {
		// Set up the event listener to listen for hand landmarks detection results

		const subscription = handLandmarksEmitter.addListener(
			"onHandLandmarksDetected",
			// setLandmarks
			(event) => {
				landmarks.value = event.landmarks[0];
				/*
				    The event contains values for landmarks and hand.
				    These values are defined in the HandLandmarkerResultProcessor class
				    found in the HandLandmarks.swift file.
				  */
				// console.log("onHandLandmarksDetected: ", event);
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
		// Request camera permission on component mount
		requestPermission().catch((error) => console.log(error));
	}, [requestPermission]);

	const hasKeypoints = () => {
		"worklet";
		return landmarks.value != null && Object.keys(landmarks.value).length > 0;
	};

	const frameProcessor = useSkiaFrameProcessor(
		(frame) => {
			"worklet";
			frame.render();
			handLandmarks(frame);

			if (hasKeypoints()) {
				const hand = landmarks.value;
				const frameWidth = frame.width;
				const frameHeight = frame.height;
				// Draw lines connecting landmarks
				for (let [from, to] of lines) {
					frame.drawLine(
						hand[from].x * Number(frameWidth),
						hand[from].y * Number(frameHeight),
						hand[to].x * Number(frameWidth),
						hand[to].y * Number(frameHeight),
						linePaint
					);
				}
				// Draw circles on landmarks
				for (let mark of Object.values(hand)) {
					frame.drawCircle(
						mark.x * Number(frameWidth),
						mark.y * Number(frameHeight),
						6,
						circlePaint
					);
				}
			}
		},
		[hasKeypoints]
	);

	if (!hasPermission) {
		// Display message if camera permission is not granted
		return <Text>No permission</Text>;
	}

	if (device == null) {
		// Display message if no camera device is available
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
			outputOrientation="device"
			photoQualityBalance="speed"
		/>
	);
}
