import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet, View } from "react-native";

interface Style {
    container: ViewStyle
    searchInputContainer: ViewStyle
    mapContainer: ViewStyle
}

export default (theme: ExtendedTheme) => {
    const { colors } = theme;

    return StyleSheet.create<Style>({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        searchInputContainer: {
            paddingTop: 10,
            paddingHorizontal: 10,
            zIndex: 100,
        },
        mapContainer: {
            justifyContent: 'flex-end',
            borderColor: "rgba(0,0,0,0.05)",
        }
    })
}