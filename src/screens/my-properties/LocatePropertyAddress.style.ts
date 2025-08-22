import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  contentContainer: ViewStyle;
  searchInputContainer: ViewStyle;
  mapContainer: ViewStyle;
  searchButtonContainer: ViewStyle;

  bottomSheetContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      height: "100%",
      width: "100%",
      justifyContent: "flex-end",
      zIndex: 2,
    },
    searchInputContainer: {
      paddingTop: 10,
      paddingHorizontal: 10,
      zIndex: 100,
    },
    searchButtonContainer: {
      paddingTop: 70,
      paddingHorizontal: 10,
      zIndex: 200,
    },
    mapContainer: {
      flex: 1,
      justifyContent: "flex-end",
      borderColor: "rgba(0,0,0,0.05)",
    },

    bottomSheetContainer: {
      flex: 1,
      width: "100%",
      alignItems: "center",
    },
  });
};
