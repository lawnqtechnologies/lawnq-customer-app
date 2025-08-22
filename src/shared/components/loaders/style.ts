import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet, Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

interface Style {
  container: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      position: "absolute",
      zIndex: 3,
      height,
      width,
      backgroundColor: colors.darkGray,
      opacity: 0.8,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: "50%",
    },
  });
};
