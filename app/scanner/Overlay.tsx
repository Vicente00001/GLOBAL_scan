import { Dimensions, Platform, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const innerDimension = 300;

export default function Overlay() {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Fondo semitransparente */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)" }]} />
      
      {/* Cuadrado central transparente */}
      <View style={[
        styles.centerBox,
        {
          left: width / 2 - innerDimension / 2,
          top: height / 2 - innerDimension / 2,
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  centerBox: {
    position: "absolute",
    width: innerDimension,
    height: innerDimension,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
});