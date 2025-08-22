import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

interface Style {
  container: ViewStyle;
  buttonContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      height,
      backgroundColor: "white",
    },

    buttonContainer: {
      height: height * 0.15,
      justifyContent: "flex-end",
    },
  });
};
