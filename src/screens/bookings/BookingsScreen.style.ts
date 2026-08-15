import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  search: ViewStyle;
  searchInputText: ViewStyle;
  loadingContainer: ViewStyle;
  itemContainer: ViewStyle;
  item: ViewStyle;
  column_1: ViewStyle;
  column_2: ViewStyle;
  statusContainer: ViewStyle;
  emptyContainer: ViewStyle;
  chatCountContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: "white",
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
    itemContainer: {
      marginBottom: 20,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      justifyContent: "center",
      borderWidth: 1,
      backgroundColor: "white",
    },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    column_1: {},
    column_2: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusContainer: {
      borderRadius: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    emptyContainer: {
      alignItems: "center",
    },
    chatCountContainer: {
      position: "absolute",
      top: -6,
      right: -20,
      backgroundColor: "red",
      height: 18,
      width: 18,
      borderRadius: 18 / 2,
      justifyContent: "center",
      alignItems: "center",
    },
  });
};
