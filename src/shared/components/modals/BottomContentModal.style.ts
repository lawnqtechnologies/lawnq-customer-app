import { ExtendedTheme } from "@react-navigation/native";
import { ViewStyle, StyleSheet } from "react-native";

interface Style {
    container: ViewStyle
    modal: ViewStyle
    content: ViewStyle
    header: ViewStyle
    body: ViewStyle
}

export default (theme: ExtendedTheme) => {
    const { colors } = theme;

    return StyleSheet.create<Style>({
        container: {
            flex: 1,
        },
        modal: {
            justifyContent: "flex-end",
            margin: 0
        },
        content: {
            backgroundColor: "#fff",
            height: "25%",
            padding: 20
        },
        header: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between"
        },
        body: {
            flex: 1,
            marginLeft: 30,
        }
    })
}