import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";
import { ImageStyle } from "react-native-fast-image";

interface Style {
  headerContainer: ViewStyle;
  header: ViewStyle;
  subHeader: ViewStyle;
  container: ViewStyle;
  leftIcon: ImageStyle;
  rightIcon: ImageStyle;
  signup: ImageStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    headerContainer: {
      paddingTop: 60,
      paddingHorizontal: 20,
      flexDirection: "row",
    },
    header: {
      height: "20%",
      justifyContent: "flex-end",
      marginBottom: 20,
      backgroundColor: "rgba(0,0,0,0.9)",
      paddingHorizontal: "6%",
      paddingBottom: "2%",
    },
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 30,
      paddingTop: 20,
      backgroundColor: "white",
    },
    subHeader: {
      marginBottom: 50,
      width: "90%",
    },
    leftIcon: {
      height: 20,
      width: 20,
      marginTop: 8,
    },
    rightIcon: {
      height: 20,
      width: 20,
      marginTop: 8,
    },
    signup: {
      flexGrow: 1,
      justifyContent: "flex-end",
      paddingBottom: 30,
    },
  });
};
