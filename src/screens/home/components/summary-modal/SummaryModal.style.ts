import {ExtendedTheme} from '@react-navigation/native';
import {v2Colors} from '@theme/themes';
import {ViewStyle, StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;
  modal: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  icon: ViewStyle;
  closeButton: ViewStyle;
  body: ViewStyle;
  item: ViewStyle;
  serviceContainer: ViewStyle;
  cardContainer: ViewStyle;
  cardLeftContent: ViewStyle;
  cardMiddleContent: ViewStyle;
  buttonContainer: ViewStyle;
  discountTitle: ViewStyle;
  discountDetail: ViewStyle;
  walletMethodIconBox: ViewStyle;
}

export default (_theme: ExtendedTheme) => {
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
    },
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    content: {
      backgroundColor: '#fff',
      minHeight: 340,
      paddingHorizontal: 30,
      paddingBottom: 35,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    header: {
      marginBottom: 20,
    },
    icon: {
      position: 'absolute',
      left: '50%',
      top: -30,
    },
    closeButton: {
      paddingTop: 20,
      height: 50,
      width: 50,
      alignItems: 'flex-end',
      alignSelf: 'flex-end',
    },
    body: {},
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    serviceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      paddingRight: 10,
    },
    discountTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      padding: 5, // Increased padding for better spacing
      backgroundColor: v2Colors.yellowGreen,
      borderRadius: 5,
      opacity: 0.9,
      alignSelf: 'flex-start', // Ensures the width follows content
    },
    discountDetail: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
      paddingRight: 10,
    },
    cardContainer: {
      minHeight: 64,
      width: '100%',
      borderWidth: 1.5,
      borderColor: v2Colors.border,
      borderRadius: 7,
      marginVertical: 15,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    cardLeftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
    },
    cardMiddleContent: {
      marginLeft: 16,
      flex: 1,
      minWidth: 0,
    },
    buttonContainer: {
      flexGrow: 1,
      justifyContent: 'flex-end',
    },
    walletMethodIconBox: {
      width: 40,
      height: 28,
      borderRadius: 5,
      backgroundColor: v2Colors.backgroundGray,
      borderWidth: 1,
      borderColor: v2Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
