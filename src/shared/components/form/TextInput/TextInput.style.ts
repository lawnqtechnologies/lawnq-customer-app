import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  verticalSpacing: ViewStyle;
  textInputStyle: ViewStyle;
  topSpacer: ViewStyle;
  bottomSpacer: ViewStyle;
  placeholderIcon: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    textInputStyle: {
      height: 54,
      borderWidth: 1,
      borderRadius: 4,
      padding: 16,
    },
    verticalSpacing: {
      marginVertical: 8,
    },
    topSpacer: {
      marginTop: 4,
    },
    bottomSpacer: {
      marginBottom: 20,
    },
    placeholderIcon: {
      marginTop: 8,
      marginRight: 8,
    },
  });
};
