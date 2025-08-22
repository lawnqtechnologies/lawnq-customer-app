import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import * as NavigationService from 'react-navigation-helpers';
import {SCREENS} from '@shared-constants';
/**
 * ? Local imports
 */
import {AUTHENTICATION} from '@shared-constants';
// import { useAuth } from '@services/hooks/useAuth';
import {RootState} from 'store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '@services/hooks/useAuth';
import {onSetToken, onUserLogin} from '@services/states/user/user.slice';
import {
  onSetBookingIntervalServiceTimeValue,
  onSetBookingServiceTypeValue,
  onSetGrassClippingsValue,
  onSetLawnImages,
  onSetProperty,
} from '@services/states/booking/booking.slice';

/**
 * Global Constants
 */
const TIMER = 5500;

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
    onGetToken();
    onSetMessagingConfig();
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
    //Get the device token
    messaging()
      .getToken()
      .then(token => {
        console.log('===================================deviceId');
        console.log(token);
        console.log('end========================================');

        return saveTokenToDatabase(token);
      });

    // // If using other push notification providers (ie Amazon SNS, etc)
    // // you may need to get the APNs token instead for iOS:
    // // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

    // // Listen to whether the token changes
    return messaging().onTokenRefresh(token => {
      saveTokenToDatabase(token);
    });
  };

  const saveTokenToDatabase = async (deviceId: any) => {
    console.log('deviceId:', deviceId);
    const id = await onGetCustomerId();

    const payload = {
      CustomerToken: await onGetToken(),
      CustomerId: id,
      DeviceId: deviceId,
      DeviceDetails: deviceDetails,
    };

    updateDeviceId(
      payload,
      data => {
        console.log('saveTokenToDatabase data:', data);
        dispatch(onUserLogin(id));
      },
      error => {
        console.log('saveTokenToDatabase error:', error);
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
