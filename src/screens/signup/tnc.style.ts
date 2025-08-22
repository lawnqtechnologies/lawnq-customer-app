import { ExtendedTheme } from "@react-navigation/native";
import { ImageStyle } from "react-native-fast-image";
import { ViewStyle, StyleSheet, Dimensions} from "react-native";
import { v2Colors } from "@theme/themes";

interface Style {

  accept: ViewStyle;
  headerContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {

  const { colors } = theme;
  return StyleSheet.create<Style>({
    accept: {
        justifyContent: "flex-end",
        paddingBottom: 50,
        

    },
    headerContainer: {
      paddingTop: 60,
      paddingHorizontal: 20,
      flexDirection: "row",
    },
  });
};
