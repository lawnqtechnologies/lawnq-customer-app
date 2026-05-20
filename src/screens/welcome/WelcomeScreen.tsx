import React, {useCallback, useMemo, useRef} from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import 'react-native-reanimated';
import * as NavigationService from 'react-navigation-helpers';
import publicIP from 'react-native-public-ip';
import {useDispatch} from 'react-redux';

/**
 * ? Local imports
 */
import createStyles from './WelcomeScreen.style';
import Setup from './functions/Setup';
import {AUTHENTICATION, SCREENS} from '@shared-constants';
import {
  onSetDeviceDetails,
  onSetToken,
  onUserLogin,
} from '@services/states/user/user.slice';
import {SystemInfo} from 'utils/system/SystemGetters';

const TIMER = 5000;
const IP_TIMEOUT = 2000;

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IWelcomeScreenProps {
  style?: CustomStyleProp;
  navigation?: any;
}

const WelcomeScreen: React.FC<IWelcomeScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const {TOKEN, CUSTOMER_ID} = AUTHENTICATION;

  /**
   * ? References
   */
  const didNavigate = useRef(false);

  /**
   * ? Functions
   */
  const getPublicIpWithTimeout = useCallback(() => {
    return new Promise<string>(resolve => {
      const timeout = setTimeout(() => resolve('000.000.0.0'), IP_TIMEOUT);

      publicIP()
        .then(ip => {
          clearTimeout(timeout);
          resolve(ip || '000.000.0.0');
        })
        .catch(error => {
          console.log('publicIP error:', error);
          clearTimeout(timeout);
          resolve('000.000.0.0');
        });
    });
  }, []);

  const setDeviceDetails = useCallback(async () => {
    const ip = await getPublicIpWithTimeout();

    dispatch(
      onSetDeviceDetails({
        ...SystemInfo,
        IpAddress: ip,
      }),
    );
  }, [dispatch, getPublicIpWithTimeout]);

  const handleWelcomeComplete = useCallback(async () => {
    if (didNavigate.current) return;
    didNavigate.current = true;

    const token = (await AsyncStorage.getItem(TOKEN)) || '';
    const customerId = (await AsyncStorage.getItem(CUSTOMER_ID)) || '';

    dispatch(onSetToken(token));
    if (customerId) {
      dispatch(onUserLogin(customerId));
    }

    NavigationService.replace(token ? SCREENS.HOME : SCREENS.LOGIN);
  }, [CUSTOMER_ID, TOKEN, dispatch]);

  /**
   * ? On Mount
   */
  useFocusEffect(
    useCallback(() => {
      didNavigate.current = false;
      setDeviceDetails();

      const fallbackTimer = setTimeout(() => {
        handleWelcomeComplete();
      }, TIMER);

      return () => {
        clearTimeout(fallbackTimer);
      };
    }, [handleWelcomeComplete, setDeviceDetails]),
  );

  return (
    <View style={styles.container}>
      <Setup />
      <View
        style={{
          height: '40%',
          width: '100%',
        }}>
        <LottieView
          style={{flex: 1}}
          source={require('@assets/animations/custom-lottie-animation/lawnq-loading.json')}
          autoPlay
          loop={false}
          onAnimationFinish={handleWelcomeComplete}
        />
      </View>
    </View>
  );
};

export default WelcomeScreen;
