import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet, Platform } from "react-native";

interface Style {
  inputContainerStyle: ViewStyle;
  topSpacer: ViewStyle;
  bottomSpacer: ViewStyle;
  labelTextStyle: ViewStyle;
  affixTextStyle: ViewStyle;
  titleTextStyle: ViewStyle;
  style: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    inputContainerStyle: {
      height: 40,
      alignItems: "center",
    },
    topSpacer: {
      marginTop: 4,
    },
    bottomSpacer: {
      marginBottom: 20,
    },
    labelTextStyle: {
      marginTop: -6,
    },
    affixTextStyle: {
      marginTop: 9,
    },
    titleTextStyle: {},
    style: {
      marginBottom: Platform.select({
        ios: -7,
        android: -10.5,
      }),
      fontSize: 14,
    },
  });
};
