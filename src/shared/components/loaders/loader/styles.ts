import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  uploadLoaderContainer: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
    zIndex: 3,
    elevation: 3,
    backgroundColor: "rgba(96, 96, 96, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: "50%",
  },
});

export default styles;
