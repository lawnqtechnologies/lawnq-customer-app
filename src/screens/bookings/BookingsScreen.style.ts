import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
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
