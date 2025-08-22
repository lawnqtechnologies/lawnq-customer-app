import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleProp, ViewStyle, StatusBar} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import {startCase} from 'lodash';
import {getReadableVersion} from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * ? Local imports
 */
import createStyles from './AccountScreen.style';
import {v2Colors} from '@theme/themes';

import {SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';

/**
 * ? SVGs
 */
import SampleProfile from '@assets/v2/account/images/user-cust.svg';
import Logout from '@assets/v2/account/icons/logout.svg';
import Wallet from '@assets/v2/account/icons/wallet.svg';
import Info from '@assets/v2/account/icons/info.svg';
import Document from '@assets/v2/account/icons/document.svg';
import Eye from '@assets/v2/account/icons/eye.svg';
import HelpCircle from '@assets/v2/account/icons/help-circle.svg';
import LifeBuoy from '@assets/v2/account/icons/life-buoy.svg';
import ChevronRight from '@assets/v2/account/icons/chevron-right.svg';
import fonts from '@fonts';
import {RootState} from 'store';
import {onSetFromAccountToPayment} from '@services/states/menu/menu.slice';
import {userLoggedOut} from '@services/states/user/user.slice';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IMenuScreenProps {
  style?: CustomStyleProp;
}

const MenuScreen: React.FC<IMenuScreenProps> = () => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const [imageUri, setImageUri] = useState<any>(null);

  /**
   * ? Redux States
   */
  const {customerInfo} = useSelector((state: RootState) => state.user);

  /**
   * ? On Mount
   */
  useFocusEffect(
    useCallback(() => {
      dispatch(onSetFromAccountToPayment(true));
    }, []),
  );

  useEffect(() => {
    if (customerInfo?.ProfilePictureLink?.length) {
      setImageUri(customerInfo?.ProfilePictureLink);
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.subHeaderContainer}>
        {imageUri !== null ? (
          <FastImage
            source={{uri: imageUri}}
            style={styles.profilePicImageStyle}
            resizeMode={'contain'}
          />
        ) : (
          <SampleProfile height={90} width={90} style={{marginRight: 10}} />
        )}
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              h3
              color={'white'}
              style={{fontFamily: fonts.lexend.extraBold, fontWeight: '600'}}>
              {`${startCase(customerInfo.Firstname)} ${startCase(
                customerInfo.Lastname,
              )}`}
            </Text>
            <View style={{height: 30}} />
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => NavigationService.push(SCREENS.PROFILE)}>
            <Text h5 color={v2Colors.green}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            dispatch(userLoggedOut());
            NavigationService.navigate(SCREENS.LANDING);
          }}
          style={styles.logoutContainer}>
          <Logout />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Body = () => (
    <View style={{flexGrow: 1, marginTop: 20}}>
      <View style={styles.topContent}>
        <TouchableOpacity
          onPress={() => NavigationService.navigate(SCREENS.PAYMENT)}
          style={styles.squareContainer}>
          <Wallet height={35} width={35} />
          <Text h4 color="black" style={{marginTop: 10}}>
            Wallet
          </Text>
        </TouchableOpacity>
        <View style={{width: '4%'}} />
        <TouchableOpacity
          onPress={() => NavigationService.navigate(SCREENS.SUPPORT)}
          style={styles.squareContainer}>
          <LifeBuoy height={35} width={35} />
          <Text h4 color="black" style={{marginTop: 10}}>
            Support
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{marginTop: 50, marginBottom: 20}}>
        <Text h4 bold color="black">
          General
        </Text>
      </View>

      {ListItem(<Info height={22} width={22} />, 'About Us', () =>
        NavigationService.navigate(SCREENS.ABOUT_US),
      )}
      {ListItem(
        <Document height={22} width={22} />,
        'Terms and Conditions',
        () => NavigationService.navigate(SCREENS.TNC, {fromProfile: true}),
      )}
      {ListItem(<Document height={22} width={22} />, 'LawnQ Guide', () => {
        NavigationService.push(SCREENS.HOME),
          AsyncStorage.setItem('Onboarding', 'null');
      })}
      {ListItem(<Eye height={22} width={22} />, 'Privacy', () =>
        NavigationService.navigate(SCREENS.PRIVACY),
      )}
      {ListItem(<HelpCircle height={22} width={22} />, 'FAQ', () =>
        NavigationService.navigate(SCREENS.FAQ),
      )}
    </View>
  );

  const ListItem = (icon: JSX.Element, text: string, onPress: () => void) => (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={styles.leftContent}>
        {icon}
        <View style={{width: 12}} />
        <Text h4>{text}</Text>
      </View>
      <ChevronRight />
    </TouchableOpacity>
  );

  const Bottom = () => (
    <View style={styles.bottomContentContainer}>
      <Text style={{marginTop: 10}}>{`v${getReadableVersion()}`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <View style={styles.subContainer}>
          <Body />
        </View>

        <Bottom />
      </ScrollView>
    </View>
  );
};

export default MenuScreen;
