import fonts from "@fonts";
import { v2Colors } from "@theme/themes";
import { StyleSheet, ViewStyle } from "react-native";

interface Styles {
  container: ViewStyle;
  textInput: ViewStyle;
  rightContent: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    height: 60,
    width: "90%",
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  textInput: {
    width: "70%",
    height: 60,
    fontFamily: fonts.lexend.regular,
    fontSize: 16,
    color: v2Colors.gray,
  },
  rightContent: {
    width: "18%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default styles;
