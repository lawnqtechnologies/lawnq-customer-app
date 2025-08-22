import { ExtendedTheme } from "@react-navigation/native";
import { v2Colors } from "@theme/themes";
import { ViewStyle, StyleSheet, Dimensions } from "react-native";
import { ImageStyle } from "react-native-fast-image";

const { height, width } = Dimensions.get("window");

interface Style {
  container: ViewStyle;

  titleContainer: ViewStyle;
  selectionContainer: ViewStyle;
  squareContentContainer: ViewStyle;
  greenCheck: ViewStyle;
  
  lawnImages: ImageStyle;
  dropdown: ViewStyle;
  radio: ViewStyle;
  imageUploadText: ViewStyle;
  imageContainer: ViewStyle;
  placeholderContainer: ViewStyle;
  imageUploadSelectContainer: ViewStyle;
  buttonSelectImage: ViewStyle;
  setAsDefaultContainer: ViewStyle;
  uploadLoaderContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: "white",
      paddingHorizontal: 20,
    },

    titleContainer: {
      marginBottom: 20,
    },
   
    selectionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },
    squareContentContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1.5,
      borderColor: v2Colors.border,
      borderRadius: 7,
      paddingHorizontal: 15,
      paddingVertical: 20,
      height: 70,
    },
    greenCheck: {
      position: "absolute",
      top: 2,
      right: 0,
    },

    lawnImages: {
      height: 150,
      width: 220,
      marginRight: 10,
      borderRadius: 10,
    },
    dropdown: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 5,
      marginHorizontal: 10,
      height: 45,
      borderColor: "#959595",
      borderWidth: 1,
      borderRadius: 5,
      paddingLeft: 10,
    },
    radio: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 10,
    },

    imageUploadText: {
      fontStyle: "italic",
      fontSize: 12,
      marginTop: 5,
    },
    imageContainer: {
      width: "100%",
      paddingVertical: 20,
      borderRadius: 7,
      backgroundColor: v2Colors.lightGreen,
      paddingHorizontal: 20,
    },
    placeholderContainer: {
      height: 80,
      width: 78,
      borderRadius: 5,
      borderWidth: 3,
      borderStyle: "dashed",
      borderColor: "#959595",
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.5,
    },
    imageUploadSelectContainer: {
      flexDirection: "row",
      height: 50,
      width: "100%",
      marginTop: 20,
      justifyContent: "space-between",
    },
    buttonSelectImage: {
      height: "100%",
      width: "46%",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "black",
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: "white",
      paddingHorizontal: 20,
    },
    setAsDefaultContainer: {
      marginHorizontal: 10,
      marginTop: 20,
      marginBottom: 10,
      flexDirection: "row",
      width: "100%",
      paddingHorizontal: 10,
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "center",
    },
    uploadLoaderContainer: {
      position: "absolute",
      height,
      width,
      zIndex: 3,
      opacity: 0.8,
      backgroundColor: colors.darkGray,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: "50%",
    },
  });
};
