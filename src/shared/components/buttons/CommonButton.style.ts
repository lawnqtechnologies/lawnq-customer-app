import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet, TextStyle } from "react-native";

interface Style {
  container: ViewStyle;
  buttonTextStyle: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 14,
      shadowRadius: 2,
      shadowOpacity: 0.7,
      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      borderRadius: 5,
    },
    buttonTextStyle: {
      color: colors.text,
      fontWeight: "700",
    },
  });
};
