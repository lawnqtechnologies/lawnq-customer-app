import React, {useMemo} from 'react';
import {View, StyleProp, ViewStyle, Pressable} from 'react-native';
import {useTheme} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
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
import {useSafeBottomPadding} from 'shared/functions/useSafeBottomInset';
import {resetAfterForeground} from '../../../utils/navigation';

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
  const bottomActionPadding = useSafeBottomPadding(20);

  /**
   * ? Functions
   */
  const onPressHome = () => {
    resetAfterForeground({
      index: 0,
      routes: [{name: SCREENS.HOME}],
    });
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
    <View style={[styles.btnContainer, bottomActionPadding]}>
      <Pressable onPress={onPressHome} style={styles.btn}>
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
      </Pressable>
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
