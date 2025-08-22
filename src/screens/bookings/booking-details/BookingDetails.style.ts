import {ExtendedTheme} from '@react-navigation/native';
import {v2Colors} from '@theme/themes';
import {ViewStyle, StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;

  viewOnTop: ViewStyle;

  headerContainer: ViewStyle;
  headerTopLeftContent: ViewStyle;
  statusContainer: ViewStyle;
  headerMidContent: ViewStyle;
  headerBottomContent: ViewStyle;
  squareContainer: ViewStyle;
  completeButtonContainer: ViewStyle;
  commsActionsContainer: ViewStyle;
  passCodeContainer: ViewStyle;
  bottomContainer: ViewStyle;
  item: ViewStyle;
  bottomSheetContainer: ViewStyle;
  customTextInput: ViewStyle;
  badge: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  // const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    completeButtonContainer: {
      backgroundColor: v2Colors.green,
      paddingVertical: 10,
      // width:180,
      paddingHorizontal: 20,
      borderRadius: 60,
      alignItems: 'center',
    },
    passCodeContainer: {
      borderWidth: 1,
      borderColor: '#ff6800',
      borderRadius: 9,
      alignItems: 'center',
    },
    viewOnTop: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      backgroundColor: v2Colors.green,
      opacity: 0.75,
    },

    headerContainer: {
      minHeight: 150,
      backgroundColor: v2Colors.lightGreen,
      marginHorizontal: 20,
      borderRadius: 10,
      padding: 20,
      marginBottom: 20,
    },
    headerTopLeftContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    statusContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: v2Colors.orange,
      borderRadius: 60,
      marginBottom: 20,
      width: 150,
    },
    headerMidContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerBottomContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    squareContainer: {
      height: 50,
      width: '47%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: 7,
      marginHorizontal: 20,
    },

    // commsActionsContainer: {
    //   position: 'absolute',
    //   bottom: 20,
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   left: '30%',
    //   // borderWidth: 1,
    // },

    commsActionsContainer: {
      position: 'absolute',
      bottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
    },

    item: {
      flexDirection: 'row',
      marginBottom: 10,
      borderBottomWidth: 1,
      paddingBottom: 10,
      paddingTop: 5,
      borderBottomColor: 'rgba(0,0,0,0.04)',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    bottomContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    bottomSheetContainer: {
      flex: 1,
      alignItems: 'center',
    },
    customTextInput: {
      borderTopWidth: 0.5,
      borderTopColor: 'rgba(0,0,0,0.5)',

      paddingBottom: 100,
      paddingHorizontal: 20,
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -3,
      height: 30,
      width: 30,
      borderRadius: 30 / 2,
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 1,
      zIndex: 999,
    },
  });
};
