import { Button, Text, TouchableOpacity, View } from "react-native";

export default function Page() {
  return (
    //Very ugly and simple UI and style :)
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22}}>Wellcome to Movement!</Text>
      <Text style={{ fontSize: 16}}>Let's do some exercise</Text>
      <TouchableOpacity 
        onPress={() => alert("Start")} 
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
    </View>
  );
}
