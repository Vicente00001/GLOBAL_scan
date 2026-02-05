import { Dimensions, Platform, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

const innerDimension = 300;

// On native platforms use react-native-skia if available, otherwise render a simple fallback
export default function Overlay() {
  if (Platform.OS === "web") {
    // simple web fallback overlay: semi-transparent background with centered transparent box
    return (
      <View style={styles.webContainer} pointerEvents="none">
        <View style={styles.centerBox} />
      </View>
    );
  }

  // Try to require Skia at runtime for native platforms; if it's missing, fallback to empty view
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const Skia = require("@shopify/react-native-skia");
    const { Canvas, DiffRect, rect, rrect } = Skia;

    const outer = rrect(rect(0, 0, width, height), 0, 0);
    const inner = rrect(
      rect(
        width / 2 - innerDimension / 2,
        height / 2 - innerDimension / 2,
        innerDimension,
        innerDimension
      ),
      50,
      50
    );

    return (
      // @ts-expect-error: dynamic import types
      <Canvas style={Platform.OS === "android" ? { flex: 1 } : StyleSheet.absoluteFillObject}>
        {/* @ts-expect-error */}
        <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
      </Canvas>
    );
  } catch (e) {
    return <View style={styles.fallback} pointerEvents="none" />;
  }
}

const styles = StyleSheet.create({
  webContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerBox: {
    width: innerDimension,
    height: innerDimension,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
