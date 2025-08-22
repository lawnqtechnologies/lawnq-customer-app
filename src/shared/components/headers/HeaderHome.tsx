import React, {useMemo} from 'react';
import {View, ImageBackground} from 'react-native';
import {useTheme} from '@react-navigation/native';
import * as _ from 'lodash';

/**
 * ?
 */
import createStyles from './HeaderHome.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import fonts from '@fonts';

import {getGreetingTime} from './helpers';

import SUN from '@assets/v2/homescreen/images/sun.svg';
import MOON from '@assets/v2/homescreen/images/moon.svg';

/**
 * ? Constants
 */
const LIGHT_HEADER_BG =
  '../../../assets/v2/homescreen/images/light-header-bg.png';
const DARK_HEADER_BG =
  '../../../assets/v2/homescreen/images/dark-header-bg.png';

interface IHeaderHomeProps {
  name?: string;
}

const HeaderHome: React.FC<IHeaderHomeProps> = ({name = ''}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const Content = () => (
    <View style={styles.content}>
      <View style={styles.leftContainer}>
        {getGreetingTime() !== 'evening' ? (
          <SUN
            width={100}
            height={100}
            style={{
              marginBottom: -20,
              marginTop: -20,
            }}
          />
        ) : (
          <MOON width={60} height={60} />
        )}

        {/* <Text color={"white"} style={{ fontSize: 16, paddingLeft: 10 }}>
          Sunny{" "}
          <Text color={"white"} fontFamily={fonts.lexend.extraBold}>
            25°
          </Text>
        </Text> */}
      </View>

      <View style={styles.rightContainer}>
        <Text color={'white'} style={{fontSize: 24}}>
          {`Good ${_.upperFirst(getGreetingTime())}`}
        </Text>

        <View style={{height: 15}} />

        <Text
          color={'white'}
          fontFamily={fonts.lexend.extraBold}
          style={{
            fontSize: 28,
            fontWeight: '900',
            textShadowColor: 'black',
          }}>{`${name}`}</Text>
      </View>
    </View>
  );

  return getGreetingTime() !== 'evening' ? (
    <ImageBackground style={styles.container} source={require(LIGHT_HEADER_BG)}>
      <Content />
    </ImageBackground>
  ) : (
    <ImageBackground style={styles.container} source={require(DARK_HEADER_BG)}>
      <Content />
    </ImageBackground>
  );
};

export default HeaderHome;
