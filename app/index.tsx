import { Link } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSharedValue, useWorklet } from "react-native-worklets-core";

export default function Page() {
	const something = useSharedValue(5);
	const worklet = useWorklet("default", (value: number) => {
		"worklet";
		something.value = value;
	});

	console.log(something.value);

	worklet(Math.random());

	useEffect(() => {
		console.log("useEffect", something.value);
	}, [something.value]);
	// worklet();
	return (
		//Very ugly and simple UI and style :)
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Text style={{ fontSize: 22 }}>Wellcome to Movement!</Text>
			<Text style={{ fontSize: 16 }}>Let's do some exercise</Text>
			<Link href="/exercise" asChild>
				<TouchableOpacity
					style={{
						borderColor: "black",
						borderWidth: 1,
						borderRadius: 5,
						paddingHorizontal: 40,
						paddingVertical: 10,
						margin: 20,
					}}
				>
					<Text style={{ fontSize: 16 }}>Start</Text>
				</TouchableOpacity>
			</Link>
		</View>
	);
}
