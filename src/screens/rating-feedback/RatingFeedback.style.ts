import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

/**
 * ? Local Imports
 */
import fonts from "@fonts";

interface Style {
  container: ViewStyle;
  starsContainer: ViewStyle;
  input: ViewStyle;
  submitBtn: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
    },
    starsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    input: {
      height: 120,
      margin: 12,
      borderWidth: 0.5,
      borderRadius: 5,
      padding: 10,
      textAlignVertical: "top",
      fontSize: 15,
      fontFamily: fonts.lexend.regular,
    },
    submitBtn: {
      marginTop: 50,
      borderRadius: 5,
    },
  });
};
