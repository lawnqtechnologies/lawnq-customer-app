import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

interface Style {
  container: ViewStyle;
  leftContainer: ViewStyle;
  cancelContainer: ViewStyle;
  deleteContainer: ViewStyle;
}

export default (_theme: ExtendedTheme, topInset: number = 0) => {
  return StyleSheet.create<Style>({
    container: {
      backgroundColor: "white",
      paddingTop: 40 + topInset,
      paddingHorizontal: 20,
      paddingBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    leftContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: width * 0.6,
    },
    cancelContainer: {
      width: width * 0.3,
      alignItems: "flex-end",
    },
    deleteContainer: {
      width: width * 0.3,
      alignItems: "flex-end",
    },
  });
};
