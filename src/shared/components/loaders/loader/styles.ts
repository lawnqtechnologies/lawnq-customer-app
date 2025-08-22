import { StyleSheet, Dimensions } from "react-native";
import { palette } from "@theme/themes";

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  uploadLoaderContainer: {
    position: "absolute",
    height,
    width,
    zIndex: 3,
    opacity: 0.8,
    backgroundColor: palette.darkGray,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: "50%",
  },
});

export default styles;
