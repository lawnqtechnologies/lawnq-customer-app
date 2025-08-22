import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  modal: ViewStyle;
  content: ViewStyle;
  bar: ViewStyle;
  header: ViewStyle;
  body: ViewStyle;

  bottomContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
    },
    modal: {
      justifyContent: "flex-end",
      margin: 0,
    },
    content: {
      backgroundColor: "#fff",
      minHeight: 280,
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
    },
    bar: {
      height: 5,
      width: 80,
      backgroundColor: "black",
      alignSelf: "center",
      marginVertical: 10,
      borderRadius: 10,
    },
    header: {
      flex: 1,
      alignItems: "center",
    },
    body: {
      flex: 1,
      marginLeft: 30,
    },

    bottomContainer: {
      flex: 1,
      justifyContent: "flex-end",
    },
  });
};
