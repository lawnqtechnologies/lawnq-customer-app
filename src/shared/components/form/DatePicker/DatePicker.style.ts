import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  textInput: ViewStyle;
  icon: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      height: 60,
      justifyContent: "center",
      paddingHorizontal: 20,
      borderWidth: 1.5,
      borderColor: v2Colors.border,
      borderRadius: 10,
      backgroundColor: "white",

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
    },
    textInput: {
      color: v2Colors.green,
      fontSize: 16,
      paddingRight: 20,
    },
    icon: {
      position: "absolute",
      justifyContent: "center",
      right: 14,
    },
  });
};
