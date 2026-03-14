import React, {useCallback, useMemo, useRef} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import 'react-native-reanimated';
import * as NavigationService from 'react-navigation-helpers';

/**
 * ? Local imports
 */
import createStyles from './WelcomeScreen.style';
import Setup from './functions/Setup';
import {SCREENS} from '@shared-constants';
import LandingScreen from '@screens/landing/LandingScreen';

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
  };

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
          onAnimationFinish={() => NavigationService.navigate(SCREENS.HOME)}
        />
      </View>
    </View>
  );
};

export default WelcomeScreen;
