import { StyleSheet, ViewStyle } from "react-native";

interface Styles {
  closeButton: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  closeButton: {
    alignSelf: "flex-end",
    marginRight: 24,
  },
});
export default styles;
