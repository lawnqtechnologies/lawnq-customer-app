import fonts from "@fonts";
import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  itemContainer: ViewStyle;
  search: ViewStyle;
  item: ViewStyle;
  searchInputText: ViewStyle;
  resetContainer: ViewStyle;
  emptyContainer: ViewStyle;
  tryAgainContainer: ViewStyle;
  loadingContainer: ViewStyle;
  othersContainer: ViewStyle;
  otherItemContainer: ViewStyle;
  statusContainer: ViewStyle;
  topContent: ViewStyle;
  pendingStatusPropContainer: ViewStyle;
  verifiedStatusPropContainer: ViewStyle;
  propertyContainer: ViewStyle;
  isDefaultContainer: ViewStyle;
  addressContainer: ViewStyle;
  defaultPropContainer: ViewStyle;
  bottomContent: ViewStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: "white",
    },

    statusContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      width: 150,
      alignSelf: "flex-end",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: v2Colors.orange,
      borderRadius: 60,
      // marginLeft:-70,
    },
    itemContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 5,
    },
    search: {
      position: "absolute",
      bottom: 4,
      right: 45,
    },
    item: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      borderRadius: 5,
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
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
    },
    tryAgainContainer: {
      marginTop: 50,
      alignSelf: "center",
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
    },
    resetContainer: {
      backgroundColor: "rgb(120,0,0)",
      position: "absolute",
      right: 20,
      top: 20,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
    },
    othersContainer: {
      height: 40,
      width: "140%",
      marginLeft: "-20%",
      paddingLeft: "20%",
      backgroundColor: v2Colors.border,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    otherItemContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
      paddingLeft: 10,
    },
    topContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 14,
      paddingHorizontal: 20,
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
    propertyContainer: {
      marginBottom: 20,
      paddingBottom: 80,
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
    bottomContent: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: v2Colors.border,
      paddingHorizontal: 20,
      paddingVertical: 10,
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
