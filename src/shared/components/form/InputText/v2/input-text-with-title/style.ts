import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
}

export default () => {
  return StyleSheet.create<Style>({
    container: {
      paddingHorizontal: 20,
      paddingTop: 10,
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
  });
};
