import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
    textInputStyle: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    textInputStyle: {
      height: 54,
      borderWidth: 1,
      borderRadius: 4,
      padding: 16,
  });
};
