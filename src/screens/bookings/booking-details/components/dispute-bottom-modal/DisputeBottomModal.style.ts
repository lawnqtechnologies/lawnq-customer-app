import { ViewStyle, StyleSheet } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenWidth, ScreenHeight } from "@freakycoder/react-native-helpers";
import fonts from "@fonts";
import { v2Colors } from "@theme/themes";
import { ImageStyle } from "react-native-fast-image";

interface Style {
  modal: ViewStyle;
  closeButton: ViewStyle;
  input: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  bottomContentContainer: ViewStyle;
  bottomContent: ViewStyle;
  loading: ViewStyle;
  imageContainer: ViewStyle;
  imageBox: ImageStyle;
  button: ViewStyle;
  
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    modal: {
      justifyContent: "flex-end",
      margin: 0,
    },
    closeButton: {
      position: "absolute",
      zIndex: 2,
      right: 5,
      top: -5,
      height: 40,
      width: 40,
    },
    input: {
      height: 100,
      marginHorizontal: 22,
      marginVertical: 20,
      borderWidth: 0.5,
      borderRadius: 5,
      padding: 10,
      textAlignVertical: "top",
      fontSize: 15,
      fontFamily: fonts.lexend.regular,
    },
    content: {
      backgroundColor: "white",
      minHeight: "60%",
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    header: {
      height: 30,
      width: "100%",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 10,
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

    loading: {
      position: "absolute",
      width: ScreenWidth,
      height: "100%",
      zIndex: 99,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    imageContainer: {
      marginTop: 30,
      marginBottom: 50,
      alignItems: "center",
    },
    imageBox: {
      width: 60,
      height: 60,
    },
    button: {
      backgroundColor: v2Colors.highlight,
      alignItems: "center",
      paddingVertical: 16,
      marginHorizontal: 60,
      borderRadius: 60,
    },
  });
};
