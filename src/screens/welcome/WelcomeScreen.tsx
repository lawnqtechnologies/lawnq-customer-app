import React, {useCallback, useMemo, useRef} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import * as NavigationService from 'react-navigation-helpers';

/**
 * ? Local imports
 */
import createStyles from './WelcomeScreen.style';
import Setup from './functions/Setup';
import {SCREENS} from '@shared-constants';
import {useSelector} from 'react-redux';
import {RootState} from 'store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LandingScreen from '@screens/landing/LandingScreen';
import {
  PERMISSIONS,
  RESULTS,
  openSettings,
  request,
  requestNotifications,
} from 'react-native-permissions';
import NotificationEnabler from 'shared/functions/NotificationEnabler';
import { clampRGBA } from 'react-native-reanimated/lib/typescript/Colors';

/**
 * ? Constants
 */
const ANIMATION =
  '../../assets/animations/custom-lottie-animation/logo-animation.json';
const TIMER = 5000;

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IWelcomeScreenProps {
  style?: CustomStyleProp;
  navigation?: any;
}

const WelcomeScreen: React.FC<IWelcomeScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * ? Redux States
   */
  const {goToScreen} = useSelector((state: RootState) => state.booking);

  /**
   * ? References
   */
  const opacity = useRef(new Animated.Value(0)).current;

  /**
   * ? On Mount
   */
  useFocusEffect(
    useCallback(() => {
      handleShowSubText();
      // AsyncStorage.removeItem('Onboarding'); // for testing only
    }, []),
  );

  /**
   * ? Functions
   */
  const handleShowSubText = () => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: TIMER - 2000,
      useNativeDriver: true,
    }).start();
    console.log('from welcome screen:');
     NavigationService.navigate(SCREENS.HOME);
  };

  const handleAnimationFinish = () => {
    console.log('Animation Finished');
    NavigationService.navigate(SCREENS.HOME);
  }

  // const Animation = () => (
  //   <LottieView
  //     source={require('@assets/animations/custom-lottie-animation/logo-animation.json')}
  //     autoPlay
  //     loop={false}
  //     style={{flex: 1}}
  //     onAnimationFinish={() => {
  //       // take note dispatch of onSetGoToScreen will be the exact screen for example SCREENS.BOOKING_DETAIL
  //       // this will be available on Notification handler
  //       if (goToScreen) return NavigationService.navigate(SCREENS.HOME);
  //       let _goToScreen = goToScreen !== undefined ? goToScreen : SCREENS.HOME;
  //       NavigationService.navigate(SCREENS.HOME);
  //     }}
  //   />
  // );

  return (
    <View style={styles.container}>
      <Setup />
      <LandingScreen />
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
          onAnimationFinish={handleAnimationFinish}
        />
      </View>
    </View>
  );
};

export default WelcomeScreen;
