import { ViewStyle, StyleSheet } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  modal: ViewStyle;
  closeButton: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  bottomContentContainer: ViewStyle;
  bottomContent: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    modal: {
      justifyContent: "flex-end",
      margin: 0,
    },
    closeButton: {
      alignSelf: "flex-end",
      marginRight: 5,
      marginTop: -30,
      height: 40,
      width: 40,
    },
    content: {
      backgroundColor: "white",
      minHeight: "76%",
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    header: {
      alignSelf: "center",
      height: 30,
      marginVertical: 10,
    },
    bottomContentContainer: {
      marginTop: 30,
      paddingHorizontal: 20,
    },
    bottomContent: {
      flexDirection: "row",
      paddingLeft: 2,
      marginTop: 10,
    },
  });
};
