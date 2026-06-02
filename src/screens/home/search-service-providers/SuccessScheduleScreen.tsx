import React, {useCallback, useEffect, useMemo} from 'react';
import {View, StyleProp, ViewStyle, Pressable} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
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
import {useSafeBottomMargin} from 'shared/functions/useSafeBottomInset';
import {resetAfterForeground} from '../../../utils/navigation';

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
  const confirmButtonBottomMargin = useSafeBottomMargin(40);
  const dispatch = useDispatch();

  /**
   * ? Actions
   */

  /**
   * ? Functions
   */
  const onPressContinue = () => {
    resetAfterForeground({
      index: 0,
      routes: [{name: SCREENS.HOME}],
    });
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
      style={styles.animation}
      source={require(SUCCESS_ANIMATION)}
      autoPlay
      loop
    />
  );

  const ConfirmBtn = () => (
    <View style={[styles.confirmBtnContainer, confirmButtonBottomMargin]}>
      <Pressable onPress={onPressContinue} style={styles.confirmBtn}>
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
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <AndroidBackButtonHandler />
      <View style={styles.animationContainer}>
        <Animation />
      </View>
      <View style={styles.contentContainer}>
        <Text h4 bold color={v2Colors.green} style={styles.titleText}>
          Thank you for booking with LawnQ!
        </Text>
        <Text h4 color={v2Colors.green} style={styles.bodyText}>
          Your service provider has been assigned, and your booking is now in
          their queue for the selected date.
        </Text>
        <Text h4 bold color={v2Colors.green} style={styles.nextStepText}>
          Next Step:
        </Text>
        <Text h4 color={v2Colors.green} style={styles.bodyText}>
          To confirm the exact time, please message your provider under:{' '}
          {'Booking -> Pending Booking -> Message Provider'}
        </Text>
        <Text h4 color={v2Colors.green} style={styles.nextStepText}>
          They will coordinate with you directly. Your lawn is in good hands!
        </Text>
      </View>
      <ConfirmBtn />
    </View>
  );
};

export default SuccessScheduleScreen;
