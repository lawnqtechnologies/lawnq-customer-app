import {ViewStyle, StyleSheet, Dimensions, TextStyle} from 'react-native';
import {ExtendedTheme} from '@react-navigation/native';
import {ImageStyle} from 'react-native-fast-image';
import {v2Colors} from '@theme/themes';

const {height, width} = Dimensions.get('window');

interface Style {
  container: ViewStyle;
  scrollContainer: ViewStyle;
  serviceTypeContainer: ViewStyle;
  grassBGcontainer: ImageStyle;
  serviceTypeTextContainer: ViewStyle;
  serviceTypeText: TextStyle;
  grassLengthContainer: ViewStyle;
  grassHeightCardContainer: ViewStyle;
  highlightedBorder: ViewStyle;
  grassLengthSquareContainer: ViewStyle;
  grassLengthTopPart: ViewStyle;
  grassLengthLowerPart: ViewStyle;
  greenCheckCircle: ViewStyle;

  actionsContainer: ViewStyle;
  leftActionContainer: ViewStyle;
  verticalSeparator: ViewStyle;
  rightActionContainer: ViewStyle;

  grassClippingsContainer: ViewStyle;
  grassClippingsSquare: ViewStyle;

  mowHeightSelectionContainer: ViewStyle;
  mowHeightCardContainer: ViewStyle;
  grassBottom: ViewStyle;

  bookingContainer: ViewStyle;
  serviceContainer: ViewStyle;
  circle: ViewStyle;
  buttonActionsContainer: ViewStyle;
  actionIcon: ImageStyle;
  questionContainer: ViewStyle;
  questionTitleContainer: ViewStyle;
  questionBtnContainer: ViewStyle;
  dropdownContainer: ViewStyle;
  lawnImages: ImageStyle;
  imageUploadText: ViewStyle;
  imageContainer: ViewStyle;
  imageUploadSelectContainer: ViewStyle;
  buttonSelectImage: ViewStyle;
  button: ViewStyle;
  uploadLoaderContainer: ViewStyle;
  opacityOnTop: ViewStyle;
  dateActionsContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingTop: 20,
      paddingHorizontal: 20,
      zIndex: 2,
    },
    scrollContainer: {
      height: '100%',
      width: '100%',
      paddingHorizontal: 10,
    },
    serviceTypeContainer: {
      marginTop: -44,
      height: 100,
      width: '100%',
      zIndex: 4,
    },
    grassBGcontainer: {
      position: 'absolute',
      height: 150,
      width: '100%',
    },
    serviceTypeTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    serviceTypeText: {
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      zIndex: 3,
    },
    grassLengthContainer: {
      flexDirection: 'row',
    },
    grassHeightCardContainer: {
      marginRight: 10,
      width: 100,
      height: 140,
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    grassLengthSquareContainer: {
      position: 'absolute',
      bottom: 0,
      width: 100,
      height: 108,
      borderWidth: 1.5,
      borderColor: v2Colors.border,
      borderRadius: 7,
      paddingBottom: 10,
    },
    highlightedBorder: {
      borderColor: v2Colors.highlight,
    },
    grassLengthTopPart: {
      height: 50,
      justifyContent: 'flex-end',
    },
    grassLengthLowerPart: {
      marginTop: 10,
      height: 120,
    },
    greenCheckCircle: {
      position: 'absolute',
      top: 2,
      right: -2,
      zIndex: 3,
    },

    actionsContainer: {
      width: '100%',
      height: 60,
      marginTop: 10,
      borderRadius: 5,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 0,
    },
    dateActionsContainer: {
      width: '100%',
      height: 60,
      borderRadius: 5,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 0,
    },
    leftActionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      height: 50,
      alignItems: 'center',
      paddingHorizontal: 15,
      // borderWidth: 1,
    },
    verticalSeparator: {
      height: '80%',
      width: 0.5,
      backgroundColor: v2Colors.border,
    },
    rightActionContainer: {
      flexDirection: 'row',
      width: '44%',
      height: 50,
      alignItems: 'center',
      paddingHorizontal: 15,
      justifyContent: 'space-between',
    },

    grassClippingsContainer: {
      flexDirection: 'row',
      marginTop: 20,
    },
    grassClippingsSquare: {
      width: '46%',
      height: 100,
      borderWidth: 1.5,
      borderColor: v2Colors.border,
      borderRadius: 7,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 20,
    },

    mowHeightSelectionContainer: {
      flexDirection: 'row',
      width: '100%',
      marginTop: 20,
      marginBottom: 30,
      justifyContent: 'space-between',
    },
    mowHeightCardContainer: {
      width: '30%',
      height: 100,
      borderWidth: 1.5,
      borderColor: v2Colors.border,
      borderRadius: 7,
      paddingTop: 5,
      zIndex: 2,
      overflow: 'hidden',
    },
    grassBottom: {
      flexGrow: 1,
      justifyContent: 'flex-end',
    },

    bookingContainer: {
      minHeight: 50,
      width: '100%',
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: 30,
    },
    serviceContainer: {
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: -10,
    },
    circle: {
      width: 80,
      height: 80,
      borderRadius: 80 / 2,
      backgroundColor: '#dadada',
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonActionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionIcon: {
      height: 20,
      width: 20,
      marginRight: 5,
    },
    questionContainer: {
      marginVertical: 10,
      paddingHorizontal: 5,
    },
    questionTitleContainer: {
      marginBottom: 10,
      // fontSize: 14,
    },
    questionBtnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 5,
      height: 50,
      borderColor: '#dadada',
      borderWidth: 2,
      borderRadius: 5,
      paddingLeft: 10,
    },
    dropdownContainer: {
      marginVertical: 30,
      zIndex: 2,
      width: '100%',
    },
    lawnImages: {
      height: 100,
      width: 200,
      marginRight: 10,
      borderRadius: 10,
      borderWidth: 0.2,
      borderColor: 'black',
      backgroundColor: '#dadada',
    },
    imageUploadText: {
      // fontStyle: "italic",
      // fontSize: 12,
      marginTop: 5,
    },

    imageContainer: {
      width: '100%',
      paddingVertical: 20,
      borderRadius: 7,
      backgroundColor: v2Colors.lightGreen,
      paddingHorizontal: 20,
    },
    imageUploadSelectContainer: {
      flexDirection: 'row',
      height: 50,
      width: '100%',
      marginTop: 20,
      justifyContent: 'space-between',
    },
    buttonSelectImage: {
      height: '100%',
      width: 'auto',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: 'black',
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: 'white',
      paddingHorizontal: 20,
    },

    button: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      marginVertical: 30,
    },
    uploadLoaderContainer: {
      position: 'absolute',
      height,
      width,
      zIndex: 3,
      opacity: 0.8,
      backgroundColor: colors.darkGray,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: '50%',
    },
    opacityOnTop: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      zIndex: 2,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
  });
};
