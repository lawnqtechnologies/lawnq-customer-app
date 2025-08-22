import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;

  itemContainer: ViewStyle;
  activeItemContainer: ViewStyle;
  itemContent: ViewStyle;
  activeItemContent: ViewStyle;
  cardDetails: ViewStyle;

  bottomContentContainer: ViewStyle;
  updateButton: ViewStyle;
  deleteButton: ViewStyle;
  divider: ViewStyle;

  buttonContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

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
      width: "80%",
      alignItems: "center",
    },

    bottomContentContainer: {
      flexDirection: "row",
      height: 40,
      width: "100%",
      justifyContent: "space-around",
      alignItems: "center",
    },
    updateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "50%",
      backgroundColor: v2Colors.highlight,
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "50%",
      backgroundColor: v2Colors.lightRed,
    },
    divider: {
      height: "100%",
      width: 1.5,
      backgroundColor: v2Colors.border,
    },

    buttonContainer: {
      flexGrow: 1,
      justifyContent: "flex-end",
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
  });
};
