import React, {useMemo, useCallback} from 'react';
import {View, StyleProp, ViewStyle, ActivityIndicator} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import {useDispatch} from 'react-redux';
import publicIP from 'react-native-public-ip';

/**
 * ? Local imports
 */
import createStyles from './LandingScreen.style';

import {SCREENS} from '@shared-constants';
import {AUTHENTICATION} from '@shared-constants';
import {SystemInfo} from '../../utils/system/SystemGetters';
import AndroidBackButtonHandler from 'shared/functions/AndroidBackButtonHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onSetDeviceDetails,
  onUserLogin,
} from '@services/states/user/user.slice';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ILandingScreenProps {
  style?: CustomStyleProp;
}

const LandingScreen: React.FC<ILandingScreenProps> = ({}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const {TOKEN, CUSTOMER_ID} = AUTHENTICATION;

  /**
   * ? On Mount
   */
  useFocusEffect(
    useCallback(() => {
      setDeviceDetails();
    }, []),
  );

  /**
   * ? Functions
   */
  const assessUserToken = async () => {
    const cid = (await AsyncStorage.getItem(CUSTOMER_ID)) || 0;
    dispatch(onUserLogin(cid));

    const token = (await AsyncStorage.getItem(TOKEN)) || '';
    if (!!token) return NavigationService.navigate(SCREENS.WELCOME);
    return NavigationService.navigate(SCREENS.LOGIN);
  };

  const setDeviceDetails = async () => {
    const dispatchDeviceDetails = (ip: string) => {
      const deviceDetails = {
        ...SystemInfo,
        ipAddress: ip,
      };
      dispatch(onSetDeviceDetails(deviceDetails));
    };

    publicIP()
      .then(ip => {
        dispatchDeviceDetails(ip);
        assessUserToken();
      })
      .catch(error => {
        console.log('error:', error);
        dispatchDeviceDetails('000.000.0.0');
        assessUserToken();
      });
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */

  return <AndroidBackButtonHandler />;
};

export default LandingScreen;
