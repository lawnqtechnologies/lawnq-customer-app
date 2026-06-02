import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
}

export default () => {
  return StyleSheet.create<Style>({
    container: {
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
};
