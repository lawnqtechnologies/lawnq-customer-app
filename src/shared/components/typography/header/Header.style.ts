import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet, TextStyle } from "react-native";

interface Style {
  bodyContainer: ViewStyle;
  bodyText: TextStyle;
}

export default (theme: ExtendedTheme) => {
  //   const { colors } = theme;
  return StyleSheet.create<Style>({
    bodyContainer: {},
    bodyText: {},
  });
};
