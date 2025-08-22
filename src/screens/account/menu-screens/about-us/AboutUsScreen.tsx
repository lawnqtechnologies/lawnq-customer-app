import React, {useMemo} from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import {useTheme} from '@react-navigation/native';

/**
 * ? Local Imports
 */
import createStyles from './AboutUsScreen.style';
import {SCREENS} from '@shared-constants';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import {ScrollView} from 'react-native-gesture-handler';
import SubHeader from '@shared-components/typography/sub-header/SubHeader';
import Body from '@shared-components/typography/body/Body';

/**
 * ? SVGs
 */
import CONNECT from '@assets/v2/common/icons/connect.svg';
import SUSTAINABILITY from '@assets/v2/common/icons/sustainability.svg';
import MOW_AND_BEYOND from '@assets/v2/common/icons/mow-and-beyond.svg';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IProfileScreenProps {
  style?: CustomStyleProp;
}

const AboutUsScreen: React.FC<IProfileScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Separator = () => <View style={styles.separatorContainer} />;

  return (
    <>
      <HeaderContainer pageTitle={'About Us'} navigateTo={SCREENS.HOME} />
      <ScrollView style={styles.container}>
        {/** 1st */}
        <View style={styles.titleContainer}>
          <CONNECT height={50} width={50} />
          <SubHeader text={'We focus on connecting people together'} />
        </View>
        <Body
          text={
            'Our mission is to connect customers with lawn mowing service providers. We understand the frustration and struggles of trying to find a reliable lawn mowing service provider. Hence, we have come up with this solution to help community members to book such services with ease. Our aim is to provide high quality technology features and services in order to maximize the customer’s benefits from using our applications.'
          }
        />
        <Body
          text={
            'We focus on using the latest and safest technologies available in the market in order to provide a high quality end product for our users. We work day and night to enhance and improve our application. We are the market leaders in this domain and will continue our journey to stay #1 in what we do best.'
          }
        />
        <Separator />

        {/** 2nd */}
        <View style={styles.titleContainer}>
          <SUSTAINABILITY height={50} width={50} />
          <SubHeader text={'Sustainability'} />
        </View>
        <Body
          text={
            'LawnQ is pushing all service providers to use tools that are  fully electric, zero-emission  by 2040, with 100% of mowing jobs taking place in zero-emission tools. It is our responsibility as the largest Lawn mowing service platform in the world to more aggressively tackle the challenge of climate change. We will do this by offering our customers more ways to mow green, helping service providers go electric, making transparency a priority and partnering with NGOs and the private sector to help expedite a clean and just energy transition.'
          }
        />
        <Separator />

        {/** 3rd */}
        <View style={styles.titleContainer}>
          <MOW_AND_BEYOND height={50} width={50} />
          <SubHeader text={'Mow and beyond'} />
        </View>
        <Body
          text={
            'In addition to helping customers find service providers to mow their lawn, we’re making sure they get quality mowing work done on their property by enforcing the rating system where the Service provider is rated based on the quality of work they perform.'
          }
        />
        <Body
          text={
            'Our job is to try and make both the customer and service provider’s communication very smooth and transparent by providing them means of communication through chat and voice services.'
          }
        />
        <Separator />
      </ScrollView>
    </>
  );
};

export default AboutUsScreen;
