import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet, TextStyle } from "react-native";

interface Style {
  container: ViewStyle;
  titleContainer: ViewStyle;
  separatorContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: "white",
      padding: 20,
    },
    titleContainer: {
      flexDirection: "row",
    },
    separatorContainer: {
      height: 30,
      width: "120%",
      borderBottomWidth: 1.5,
      borderBottomColor: v2Colors.border,
      marginBottom: 30,
      marginLeft: -20,
    },
  });
};
