import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  headerContainer: ViewStyle;
  subHeader: ViewStyle;
  roundedTextInput: ViewStyle;
  submit: ViewStyle;
  textInputContainer: ViewStyle;
  resendOTP: ViewStyle;
  errorContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
      backgroundColor: "white",
    },
    headerContainer: {
      paddingTop: 60,
      paddingHorizontal: 20,
      flexDirection: "row",
    },
    subHeader: {
      marginBottom: 30,
    },
    roundedTextInput: {
      borderRadius: 10,
      borderWidth: 2,
      width: 46,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
    },
    submit: {
      flexGrow: 1,
      justifyContent: "flex-end",
      paddingBottom: 30,
    },
    textInputContainer: {
      marginBottom: "5%",
    },
    resendOTP: {
      alignSelf: "flex-end",
      marginRight: 10,
    },
    errorContainer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      backgroundColor: v2Colors.red,
      borderRadius: 7,
      height: 50,
      marginBottom: 30,
    },
  });
};
