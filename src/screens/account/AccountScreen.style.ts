import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet, Dimensions, NativeModules } from "react-native";
const { StatusBarManager } = NativeModules;
import { ImageStyle } from "react-native-fast-image";

const { height, width } = Dimensions.get("window");
interface Style {
  container: ViewStyle;
  subContainer: ViewStyle;
  headerContainer: ViewStyle;
  subHeaderContainer: ViewStyle;
  profilePicImageStyle: ImageStyle;
  profileButton: ViewStyle;
  logoutContainer: ViewStyle;

  topContent: ViewStyle;
  squareContainer: ViewStyle;

  listItem: ViewStyle;
  leftContent: ViewStyle;

  bottomContentContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    subContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    headerContainer: {
      height: 150 + StatusBarManager.HEIGHT,
      width: "100%",
      backgroundColor: v2Colors.green,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      paddingBottom: "5%",
      paddingTop: 30 + StatusBarManager.HEIGHT,
    },
    subHeaderContainer: {
      paddingHorizontal: 20,
      flexDirection: "row",
    },
    profilePicImageStyle: {
      
      
      height: 90,
      width: 90,
      borderRadius: 60,
      marginRight: 20,
    },
    profileButton: {
      height: 40,
      width: 100,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "white",
      padding: 5,
      borderRadius: 8,
      marginTop: 8,
    },
    logoutContainer: {
      paddingTop: 4,
    },

    topContent: {
      flexDirection: "row",
    },
    squareContainer: {
      height: 120,
      width: width * 0.43,
      borderWidth: 2,
      borderColor: v2Colors.highlight,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },

    listItem: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: v2Colors.backgroundGray,
      borderBottomWidth: 1.5,
      borderBottomColor: v2Colors.border,
    },
    leftContent: {
      flexDirection: "row",
      alignItems: "center",
    },

    bottomContentContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      paddingTop: height * 0.1,
    },
  });
};
