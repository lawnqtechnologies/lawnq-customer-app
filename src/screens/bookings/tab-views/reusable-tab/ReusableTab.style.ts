import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  item: ViewStyle;
  bookingRefContainer: ViewStyle;
  column_1: ViewStyle;
  column_2: ViewStyle;
  badge: ViewStyle;
  bottomContentContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      paddingVertical: 5,
    },
    item: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
      borderRadius: 10,
      paddingTop: 15,
      paddingHorizontal: 20,
    },
    bookingRefContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    column_1: { width: "72%" },
    column_2: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "20%",
    },
    badge: {
      position: "absolute",
      top: -2,
      right: -3,
      height: 12,
      width: 12,
      borderRadius: 12 / 2,
      backgroundColor: "red",
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 1,
    },
    bottomContentContainer: {
      height: 30,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: v2Colors.backgroundGray,
      paddingHorizontal: 20,
    },
  });
};
