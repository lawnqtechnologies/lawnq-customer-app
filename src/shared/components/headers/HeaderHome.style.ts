import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  bgImage: ViewStyle;
  content: ViewStyle;
  leftContainer: ViewStyle;
  rightContainer: ViewStyle;
}

export default (theme: ExtendedTheme, topInset: number = 0) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      paddingTop: topInset,
      minHeight: 140 + topInset,
    },
    bgImage: {
      position: "absolute",
      left: -20,
    },
    content: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 30,
      paddingBottom: 35,
      paddingLeft: 10,
      paddingRight: 25,
      zIndex: 2,
    },
    leftContainer: {
      flex: 1,
      justifyContent: "flex-end",
    },
    rightContainer: {
      flex: 1,
      alignItems: "flex-end",
      justifyContent: "flex-end",
    },
  });
};
