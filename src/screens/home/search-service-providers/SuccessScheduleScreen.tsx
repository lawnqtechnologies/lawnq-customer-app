import React, {useCallback, useEffect, useMemo} from 'react';
import {View, StyleProp, ViewStyle, TouchableOpacity} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import LottieView from 'lottie-react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

/**
 * ? Local imports
 */
import createStyles from './SuccessScreen.style';

import {SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';
import {useDispatch} from 'react-redux';
import AndroidBackButtonHandler from 'shared/functions/AndroidBackButtonHandler';
import {onSetFromAccountToPayment} from '@services/states/menu/menu.slice';
import {v2Colors} from '@theme/themes';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ? Constants
 */
const SUCCESS_ANIMATION =
  '../../../assets/animations/custom-lottie-animation/success-find-sp-animation.json';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ISuccessScreenProps {
  style?: CustomStyleProp;
  navigation?: any;
  route?: any;
}

const SuccessScheduleScreen: React.FC<ISuccessScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  /**
   * ? Actions
   */

  /**
   * ? Functions
   */
  const onPressContinue = () => {
    NavigationService.push(SCREENS.HOME);
  };

  /**
   * ? On Mount
   */
  useFocusEffect(
    useCallback(() => {
      dispatch(onSetFromAccountToPayment(false));
    }, []),
  );

  useEffect(() => {
    AsyncStorage.removeItem('bookingAccepted');
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */

  const Animation = () => (
    <LottieView
      style={{flex: 1}}
      source={require(SUCCESS_ANIMATION)}
      autoPlay
      loop
    />
  );

  const ConfirmBtn = () => (
    <View style={styles.confirmBtnContainer}>
      <TouchableOpacity onPress={onPressContinue} style={styles.confirmBtn}>
        <Icon
          name="check"
          type={IconType.Entypo}
          color="black"
          size={20}
          style={{marginRight: 5}}
        />
        <Text h4 bold color="black">
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <AndroidBackButtonHandler />
      <View style={styles.animationContainer}>
        <Animation />
      </View>
      <Text h4 bold color={v2Colors.green} style={styles.text}>
        Thank you for booking with LawnQ!
      </Text>
      <Text h4 color={v2Colors.green} style={styles.text}>
        Your service provider has been assigned, and your booking is now in
        their queue for the selected date.
      </Text>
      <Text
        h4
        bold
        color={v2Colors.green}
        style={{marginTop: 20, textAlign: 'justify'}}>
        Next Step:
      </Text>
      <Text h4 color={v2Colors.green} style={{textAlign: 'justify'}}>
        To confirm the exact time, please message your provider under: Booking →
        Pending Booking → Message Provider
      </Text>
      <Text
        h4
        color={v2Colors.green}
        style={{
          textAlign: 'center',
          marginTop: 20,
          fontWeight: 'medium',
        }}>
        They’ll coordinate with you directly. Your lawn is in good hands!
      </Text>
      <ConfirmBtn />
    </View>
  );
};

export default SuccessScheduleScreen;
