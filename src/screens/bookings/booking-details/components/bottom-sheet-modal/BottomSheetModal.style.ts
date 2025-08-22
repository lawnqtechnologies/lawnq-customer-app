import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet, Platform } from "react-native";

interface Style {
  container: ViewStyle;
  modal: ViewStyle;
  content: ViewStyle;
  contentContainer: ViewStyle;
  body: ViewStyle;
  intialContentContainer: ViewStyle;
  textInputBtn: ViewStyle;
  rightContent: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      zIndex: 4,
    },
    modal: {
      justifyContent: "flex-end",
      margin: 0,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      height: "100%",
      backgroundColor: "white",
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
    },
    body: {
      flex: 1,
      marginLeft: 30,
    },
    intialContentContainer: {
      paddingTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    textInputBtn: {
      height: 60,
      width: "90%",
      borderRadius: 7,
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      alignItems: "center",

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
    },
    rightContent: {
      flexDirection: "row",
      alignItems: "center",
      width: "18%",
      justifyContent: "space-between",
    },
  });
};
