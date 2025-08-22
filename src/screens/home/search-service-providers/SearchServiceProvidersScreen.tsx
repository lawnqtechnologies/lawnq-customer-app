import React, {useMemo} from 'react';
import {View, StyleProp, ViewStyle, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import * as NavigationService from 'react-navigation-helpers';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

/**
 * ? Local imports
 */
import createStyles from './SearchServiceProvidersScreen.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import SearchSPFunction from './functions/SearchSP';
import {SCREENS} from '@shared-constants';
import AndroidBackButtonHandler from 'shared/functions/AndroidBackButtonHandler';
import {v2Colors} from '@theme/themes';

/**
 * ? Constants
 */
const FIND_ANIMATION =
  '../../../assets/animations/custom-lottie-animation/mowing-animation.json';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IWSearchServiceProvidersScreenProps {
  style?: CustomStyleProp;
  route: any;
}

const SearchServiceProvidersScreen: React.FC<
  IWSearchServiceProvidersScreenProps
> = ({route}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * ? Functions
   */
  const onPressHome = () => {
    NavigationService.navigate(SCREENS.HOME);
  };
  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Animation = () => (
    <LottieView
      style={{flex: 1}}
      source={require(FIND_ANIMATION)}
      autoPlay
      loop
    />
  );

  const BottomActions = () => (
    <View style={styles.btnContainer}>
      <TouchableOpacity onPress={onPressHome} style={styles.btn}>
        <Icon
          name="home"
          type={IconType.MaterialIcons}
          color={v2Colors.green}
          size={20}
          style={styles.icon}
        />
        <Text h3 bold color={v2Colors.green}>
          HOME
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <AndroidBackButtonHandler />
      <SearchSPFunction params={route.params} />
      <View style={styles.animationContainer}>
        <Animation />
      </View>
      <Text h4 bold color={v2Colors.green} style={styles.text}>
        Searching nearby Service Provider...
      </Text>
      <BottomActions />
    </View>
  );
};

export default SearchServiceProvidersScreen;
