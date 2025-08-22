import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet, TextStyle } from "react-native";

interface Style {
  bodyContainer: ViewStyle;
  bodyText: TextStyle;
  bulletedTextContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  //   const { colors } = theme;
  return StyleSheet.create<Style>({
    bodyContainer: {
      marginTop: 20,
      marginLeft: 20,
    },
    bodyText: {
      lineHeight: 20,
      width: "95%",
      textAlign: "justify",
    },
    bulletedTextContainer: {
      lineHeight: 20,
      width: "85%",
      textAlign: "justify",
      flexDirection: "row",
      marginLeft: 25,
      marginTop: 15,
    },
  });
};
