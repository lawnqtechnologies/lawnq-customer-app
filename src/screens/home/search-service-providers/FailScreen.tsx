import React, {useEffect, useMemo} from 'react';
import {View, StyleProp, ViewStyle, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import * as NavigationService from 'react-navigation-helpers';
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

/**
 * ? Constants
 */
const FAIL_ANIMATION =
  '../../../assets/animations/custom-lottie-animation/fail-find-sp-animation.json';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IFailScreenProps {
  style?: CustomStyleProp;
  navigation: any;
  params: any;
}

const FailScreen: React.FC<IFailScreenProps> = ({navigation, params}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    NavigationService.push(SCREENS.HOME);
    dispatch(onSetLawnURIList([]));
  };

  const onPressTryAgain = () => {
    NavigationService.push(SCREENS.SEARCH_SERVICE_PROVIDERS);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const BottomActions = () => (
    <View style={styles.btnContainer}>
      {/* <TouchableOpacity onPress={onPressTryAgain} style={styles.btn1}>
        <Icon
          name="retweet"
          type={IconType.AntDesign}
          color="white"
          size={20}
        />
        <Text h4 bold color="white" style={{paddingLeft: 10}}>
          Try Again
        </Text>
      </TouchableOpacity>
      <View style={{width: 20}} /> */}
      <TouchableOpacity onPress={onPressHome}>
        <Icon
          name="home"
          type={IconType.MaterialIcons}
          color={v2Colors.green}
          size={35}
          style={styles.btn2}
        />
      </TouchableOpacity>
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
