import { ViewStyle, StyleSheet, Dimensions, View } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";

const { height, width } = Dimensions.get("screen");

interface Style {
  container: ViewStyle;
  icon: ViewStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      minHeight: height * 0.22,
      width: width * 0.8,
      alignSelf: "center",
      backgroundColor: "white",
      padding: 30,
      borderRadius: 30,
    },
    icon: {
      width: "100%",
      marginTop: -60,
      alignItems: "center",
    },
    buttonContainer: {
      height: 50,
      width: "100%",
      flexGrow: 1,
      justifyContent: "flex-end",
    },
    button: {
      height: 50,
      backgroundColor: v2Colors.green,
      borderRadius: 7,
      alignItems: "center",
      justifyContent: "center",
    },
  });
};
