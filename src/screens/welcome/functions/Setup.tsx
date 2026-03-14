import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import { getMessaging } from '@react-native-firebase/messaging';
import * as NavigationService from 'react-navigation-helpers';
/**
 * ? Local imports
 */
import {AUTHENTICATION} from '@shared-constants';
// import { useAuth } from '@services/hooks/useAuth';
import {RootState} from 'store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '@services/hooks/useAuth';
import {onSetToken, onUserLogin} from '@services/states/user/user.slice';
import {SystemInfo} from 'utils/system/SystemGetters';
import {
  onSetBookingIntervalServiceTimeValue,
  onSetBookingServiceTypeValue,
  onSetGrassClippingsValue,
  onSetLawnImages,
  onSetProperty,
} from '@services/states/booking/booking.slice';

const Setup: React.FC<any> = () => {
  const {TOKEN, CUSTOMER_ID} = AUTHENTICATION;
  const dispatch = useDispatch();

  /**
  |--------------------------------------------------
  | Redux
  |--------------------------------------------------
  */
  const {deviceDetails} = useSelector((state: RootState) => state.user);

  /**
  |--------------------------------------------------
  | Hooks
  |--------------------------------------------------
  */
  const {updateDeviceId} = useAuth();
  /**
  |--------------------------------------------------
  | Effects
  |--------------------------------------------------
  */
  useFocusEffect(
    useCallback(() => {
      onGetDetails();
    }, []),
  );

  /**
  |--------------------------------------------------
  | Methods
  |--------------------------------------------------
  */
  const onGetDetails = async () => {
    console.log('onGetDetails');
    const token = await onGetToken();
    if (token) {
      onSetMessagingConfig();
    }
    resetBookingDetails();
  };

  const onGetToken = async () => {
    const token = (await AsyncStorage.getItem(TOKEN)) || '';

    dispatch(onSetToken(token));
    return token;
  };

  const onGetCustomerId = async () => {
    const id = (await AsyncStorage.getItem(CUSTOMER_ID)) || '';
    return id;
  };

  const onSetMessagingConfig = () => {
    const messagingInstance = getMessaging();

    // Get the device token
    messagingInstance
      .getToken()
      .then(token => {
        return saveTokenToDatabase(token);
      })
      .catch(err => console.log('getToken error:', err));

    // If using other push notification providers (ie Amazon SNS, etc)
    // you may need to get the APNs token instead for iOS:
    // if(Platform.OS == 'ios') { messagingInstance.getAPNSToken().then(token => saveTokenToDatabase(token)); }

    // Listen to whether the token changes
    return messagingInstance.onTokenRefresh(token => {
      saveTokenToDatabase(token);
    });
  };

  const saveTokenToDatabase = async (deviceId: any) => {
    console.log('deviceId:', deviceId);
    if (!deviceId) return;

    const token = await onGetToken();
    const id = await onGetCustomerId();
    if (!token || !id) return;

    const fallbackDeviceDetails = {
      AppVersion: SystemInfo.AppVersion || '0',
      Platform: SystemInfo.Platform || 'ios',
      PlatformOs: SystemInfo.PlatformOs || 'ios',
      DeviceVersion: SystemInfo.DeviceVersion || '0',
      DeviceModel: SystemInfo.DeviceModel || 'Unknown',
      MacAddress: SystemInfo.MacAddress || '22:22:22:22:22:22',
      IpAddress: '000.000.0.0',
    };

    const normalizedDeviceDetails = {
      ...fallbackDeviceDetails,
      ...deviceDetails,
      AppVersion:
        (deviceDetails as any)?.AppVersion || fallbackDeviceDetails.AppVersion,
      Platform:
        (deviceDetails as any)?.Platform || fallbackDeviceDetails.Platform,
      PlatformOs:
        (deviceDetails as any)?.PlatformOs || fallbackDeviceDetails.PlatformOs,
      DeviceVersion:
        (deviceDetails as any)?.DeviceVersion ||
        fallbackDeviceDetails.DeviceVersion,
      DeviceModel:
        (deviceDetails as any)?.DeviceModel || fallbackDeviceDetails.DeviceModel,
      MacAddress:
        (deviceDetails as any)?.MacAddress || fallbackDeviceDetails.MacAddress,
      IpAddress:
        (deviceDetails as any)?.IpAddress ||
        (deviceDetails as any)?.ipAddress ||
        fallbackDeviceDetails.IpAddress,
    };

    const payload = {
      CustomerToken: token,
      CustomerId: id,
      DeviceId: deviceId,
      DeviceDetails: normalizedDeviceDetails,
    };

    updateDeviceId(
      payload,
      data => {
        console.log('saveTokenToDatabase data:', data);
        dispatch(onUserLogin(id));
      },
      (error: any) => {
        console.log('saveTokenToDatabase error status:', error?.response?.status);
        console.log('saveTokenToDatabase error data:', error?.response?.data);
        Alert.alert('System', 'Something went wrong, please try again.', [
          {
            text: 'Confirm',
            onPress: () => {
              NavigationService.popToTop();
            },
          },
        ]);
      },
    );
  };

  const resetBookingDetails = () => {
    dispatch(onSetLawnImages([]));
    resetBookingDropdowns();
    dispatch(
      onSetProperty({label: '', value: '0', shortDesc: '', lawnArea: 0}),
    );
  };

  const resetBookingDropdowns = () => {
    dispatch(onSetBookingIntervalServiceTimeValue({label: '', value: '0'}));
    dispatch(onSetBookingServiceTypeValue({label: '', value: '0'}));
    dispatch(onSetGrassClippingsValue({label: '', value: '0'}));
  };

  return null;
};
export default Setup;
