import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  inputView: ViewStyle;
  input: ViewStyle;
  leftIcon: ViewStyle;
  rightIcon: ViewStyle;
  errorView: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      marginBottom: 30,
    },
    inputView: {
      width: "100%",
      height: 40,
      borderBottomColor: "rgba(0,0,0,0.1)",
      borderBottomWidth: 1,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    input: {
      position: "relative",
      paddingHorizontal: 2,
      bottom: 0,
      width: "80%",
      borderRadius: 5,
      // fontFamily: 'Hermes-Regular',
      fontSize: 16,
      // paddingBottom: 10,
    },
    leftIcon: {
      flex: 1,
      paddingBottom: 10,
    },
    rightIcon: {
      flex: 1,
      paddingBottom: 10,
    },
    errorView: {
      marginLeft: 10,
    },
  });
};
