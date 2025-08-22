import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet, TextStyle } from "react-native";

interface Style {
  container: ViewStyle;
  separatorContainer: ViewStyle;
  separatorContainer2: ViewStyle;
  bodyWithURLContainer: TextStyle;
  url: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: "white",
      padding: 20,
    },
    separatorContainer: {
      height: 30,
    },
    separatorContainer2: {
      height: 20,
    },
    bodyWithURLContainer: {
      marginTop: 20,
      marginLeft: 20,
      textAlign: "justify",
      lineHeight: 20,
      width: "90%",
    },
    url: {
      color: "blue",
      textDecorationLine: "underline",
    },
  });
};
