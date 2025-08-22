import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  modal: ViewStyle;
  content: ViewStyle;
  headerIndicator: ViewStyle;
  header: ViewStyle;
  body: ViewStyle;
  bodyText: ViewStyle;
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
      paddingBottom: 30,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    headerIndicator: {
      height: 5,
      width: 100,
      backgroundColor: "black",
      marginTop: 5,
      marginBottom: 20,
      alignSelf: "center",
      borderRadius: 5,
    },
    header: {
      flex: 1,
    },
    body: {
      flex: 3,
      marginLeft: 30,
    },
    bodyText: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
  });
};
