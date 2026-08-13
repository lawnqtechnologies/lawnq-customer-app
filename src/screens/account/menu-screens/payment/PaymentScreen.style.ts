import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet, TextStyle } from "react-native";

interface Style {
  container: ViewStyle;

  itemContainer: ViewStyle;
  activeItemContainer: ViewStyle;
  itemContent: ViewStyle;
  activeItemContent: ViewStyle;
  cardDetails: ViewStyle;
  rowActions: ViewStyle;
  removeIconButton: ViewStyle;

  walletPayContainer: ViewStyle;
  walletPayContent: ViewStyle;
  walletPayIconContainer: ViewStyle;
  walletPayTextContainer: ViewStyle;
  walletPayTitle: TextStyle;
  walletPaySubtitle: TextStyle;

  buttonContainer: ViewStyle;
}

export default (_theme: ExtendedTheme) => {
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: "white",
    },

    itemContainer: {
      backgroundColor: "#fff",
      borderBottomWidth: 1.5,
      borderBottomColor: v2Colors.border,
      paddingVertical: 15,
      justifyContent: "center",
      paddingHorizontal: 10,
      opacity: 0.7,
    },
    activeItemContainer: {
      backgroundColor: v2Colors.backgroundGray,
      borderBottomWidth: 1.5,
      borderBottomColor: v2Colors.border,
      paddingVertical: 15,
      justifyContent: "center",

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,

      elevation: 4,
    },
    itemContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    activeItemContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 30,
    },
    cardDetails: {
      flexDirection: "row",
      flex: 1,
      minWidth: 0,
      alignItems: "center",
    },
    rowActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    removeIconButton: {
      padding: 6,
    },

    walletPayContainer: {
      backgroundColor: "#fff",
      borderBottomWidth: 1.5,
      borderBottomColor: v2Colors.border,
      paddingVertical: 15,
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    walletPayContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    walletPayIconContainer: {
      alignItems: "center",
      justifyContent: "center",
      height: 40,
      width: 40,
      borderRadius: 6,
      backgroundColor: v2Colors.backgroundGray,
    },
    walletPayTextContainer: {
      flex: 1,
      marginHorizontal: 18,
    },
    walletPayTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
    walletPaySubtitle: {
      fontSize: 12,
      marginTop: 4,
    },

    buttonContainer: {
      flexGrow: 1,
      justifyContent: "flex-end",
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
  });
};
