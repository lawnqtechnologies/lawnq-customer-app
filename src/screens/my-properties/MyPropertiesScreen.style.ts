import fonts from "@fonts";
import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  search: ViewStyle;
  searchInputText: ViewStyle;
  loadingContainer: ViewStyle;
  propertyContainer: ViewStyle;
  topContent: ViewStyle;
  bottomContent: ViewStyle;
  isDefaultContainer: ViewStyle;
  defaultPropContainer: ViewStyle;
  statusContainer: ViewStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  pendingStatusPropContainer: ViewStyle;
  verifiedStatusPropContainer: ViewStyle;
  addressContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      paddingBottom: 30,
      backgroundColor: "white",
    },
    statusContainer: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      width: 150,
      alignSelf: "flex-end",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: v2Colors.orange,
      borderRadius: 60,
      marginRight: 20,
      marginTop: -50,
      marginBottom: 5,
    },
    search: {
      position: "absolute",
      bottom: 4,
      right: 45,
      zIndex: 3,
    },
    searchInputText: {
      borderColor: v2Colors.border,
      borderWidth: 2,
      borderRadius: 5,
      height: 40,
      margin: 20,
      marginBottom: 0,
      paddingLeft: 20,
      paddingRight: 70,
      minHeight: 50,
      marginHorizontal: 30,
      fontFamily: fonts.lexend.regular,
      fontSize: 16,
      backgroundColor: "white",

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,

      elevation: 4,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
    },

    propertyContainer: {
      marginBottom: 20,
      paddingBottom: 80,
    },
    topContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 14,
      paddingHorizontal: 20,
    },
    bottomContent: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: v2Colors.border,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    isDefaultContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      flex: 1,
    },
    addressContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      flex: 1,
      marginTop: 10,
    },
    defaultPropContainer: {
      backgroundColor: v2Colors.green,
      paddingVertical: 5,
      paddingHorizontal: 11,
      borderRadius: 5,
      alignItems: "center",
      marginHorizontal: 1,
    },

    pendingStatusPropContainer: {
      backgroundColor: v2Colors.orange,
      paddingVertical: 2,
      paddingHorizontal: 10,
      borderRadius: 5,
      alignItems: "center",
      marginHorizontal: 1,
      flexDirection: "row",
    },

    verifiedStatusPropContainer: {
      backgroundColor: v2Colors.blue,
      paddingVertical: 2,
      paddingHorizontal: 10,
      borderRadius: 5,
      alignItems: "center",
      marginHorizontal: 1,
      flexDirection: "row",
    },

    buttonContainer: {
      position: "absolute",
      bottom: 20,
      alignSelf: "center",
    },
    button: {
      alignSelf: "center",
      backgroundColor: v2Colors.green,
      paddingHorizontal: 25,
      paddingVertical: 15,
      borderRadius: 30,
      flexDirection: "row",
      alignItems: "center",
    },
  });
};
