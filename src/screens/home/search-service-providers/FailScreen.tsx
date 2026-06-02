import React, {useEffect, useMemo} from 'react';
import {View, StyleProp, ViewStyle, Pressable} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import LottieView from 'lottie-react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {v2Colors} from '@theme/themes';
/**
 * ? Local imports
 */
import createStyles from './FailScreen.style';

import {SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';
import AndroidBackButtonHandler from 'shared/functions/AndroidBackButtonHandler';
import {onSetLawnURIList} from '@services/states/booking/booking.slice';
import {useSafeBottomMargin} from 'shared/functions/useSafeBottomInset';
import {resetAfterForeground} from '../../../utils/navigation';

/**
 * ? Constants
 */
const FAIL_ANIMATION =
  '../../../assets/animations/custom-lottie-animation/fail-find-sp-animation.json';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IFailScreenProps {
  style?: CustomStyleProp;
  navigation: any;
  route?: any;
}

const FailScreen: React.FC<IFailScreenProps> = ({navigation}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bottomActionMargin = useSafeBottomMargin(40);
  /**
   * ? Watchers
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {});

    return unsubscribe;
  }, [navigation]);

  /**
   * ? Functions
   */
  const onPressHome = () => {
    resetAfterForeground({
      index: 0,
      routes: [{name: SCREENS.HOME}],
    });
    dispatch(onSetLawnURIList([]));
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const BottomActions = () => (
    <View style={[styles.btnContainer, bottomActionMargin]}>
      <Pressable onPress={onPressHome}>
        <Icon
          name="home"
          type={IconType.MaterialIcons}
          color={v2Colors.green}
          size={35}
          style={styles.btn2}
        />
      </Pressable>
    </View>
  );

  const Animation = () => (
    <LottieView source={require(FAIL_ANIMATION)} autoPlay loop />
  );

  return (
    <View style={styles.container}>
      <AndroidBackButtonHandler />
      <View style={styles.animationContainer}>
        <Animation />
      </View>
      <Text h4 bold color={v2Colors.greenShade2} style={styles.text}>
        Oops!
      </Text>
      <Text h4 bold color={v2Colors.greenShade2} style={styles.text}>
        All our Service Providers are currently busy. Please try again later.
      </Text>
      <BottomActions />
    </View>
  );
};

export default FailScreen;
