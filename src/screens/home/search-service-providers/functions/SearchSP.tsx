import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import * as NavigationService from 'react-navigation-helpers';

/**
 * ? Local Imports
 */
import {SCREENS} from '@shared-constants';
import {useBooking} from '@services/hooks/useBooking';
import {useFocusEffect} from '@react-navigation/native';
import {Alert} from 'react-native';
import {RootState} from 'store';
import {onSetLawnURIList} from '@services/states/booking/booking.slice';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ? Constants
 */
//const TIMER = 7000; // 7 seconds

interface ISearchSPFunctionProps {
  params: any;
}

const SearchSPFunction: React.FC<ISearchSPFunctionProps> = ({params}) => {
  const dispatch = useDispatch();
  const {grassClippingsValue} = useSelector(
    (state: RootState) => state.booking,
  );
  /**
   * ? Actions
   */
  const {findSP} = useBooking();

  /**
   * ? Redux States
   */
  const {customerId, token, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );
  const {property, bookingRefNo, selectedServiceTypeId} = useSelector(
    (state: RootState) => state.booking,
  );

  /**
  |--------------------------------------------------
  | States
  |--------------------------------------------------s
  */
  const [waiting, setWaiting] = useState<boolean>(true); // Waiting state
  const [timeLeft, setTimeLeft] = useState<number>(40); // 40-second timer
  const [timeout, setTimeoutState] = useState<boolean>(false); // Timeout state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  /**
   * ? On Mount
   */
  useFocusEffect(
    useCallback(() => {
      onFindSPonDemand();
    }, []),
  );

  /**
  |--------------------------------------------------
  | timer of the screen
  |--------------------------------------------------
  */
  useEffect(() => {
    // this will only calll on booking today
    // Function to check if booking has already been accepted
    const checkBookingAccepted = async () => {
      const bookingAccepted = await AsyncStorage.getItem('bookingAccepted');
      if (bookingAccepted === 'true') {
        clearInterval(interval); // Stop the interval
        setWaiting(false); // Stop waiting
        console.log('Successfully processed on waiting screen');
        AsyncStorage.removeItem('bookingAccepted');
        NavigationService.navigate(SCREENS.SUCCESS); // Example navigation to success
      }
    };

    // Start the 40-second countdown
    const interval = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    // Clear the interval if timeLeft reaches 0 or if booking is accepted
    if (timeLeft === 0) {
      clearInterval(interval);
      setWaiting(false); // Stop waiting
      setTimeoutState(true); // Mark as timeout
      onQueryFail();
    }

    checkBookingAccepted();

    // Listen for Firebase Notification for service provider acceptance
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const {data} = remoteMessage;
      const messageString =
        typeof data?.Message === 'string' ? data.Message : undefined;
      const action: string | undefined = messageString
        ? JSON.parse(messageString)?.action
        : undefined;

      if (action === 'ACCEPT') {
        clearInterval(interval);
        setWaiting(false); // Stop waiting
        // Navigate to booking success screen
        AsyncStorage.removeItem('bookingAccepted');
        NavigationService.navigate(SCREENS.SUCCESS);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [timeLeft]);

  /**
  |--------------------------------------------------
  | check check storage from background
  |--------------------------------------------------
  */

  const getCurrentDateTime = () => {
    const now = new Date();

    // Pad with leading zeros
    const padWithZero = (num: number) => num.toString().padStart(2, '0');

    // Get individual parts
    const year = now.getFullYear();
    const month = padWithZero(now.getMonth() + 1); // Months are zero-based
    const day = padWithZero(now.getDate());
    const hours = padWithZero(now.getHours());
    const minutes = padWithZero(now.getMinutes());
    const seconds = padWithZero(now.getSeconds());
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0'); // Ensure 3 digits for milliseconds

    // Construct the formatted date-time string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const getCurrentDateTimePlus30Seconds = () => {
    const now = new Date();

    // Add 40 seconds to the current time
    now.setSeconds(now.getSeconds() + 30);

    // Pad with leading zeros
    const padWithZero = (num: number) => num.toString().padStart(2, '0');

    // Get individual parts
    const year = now.getFullYear();
    const month = padWithZero(now.getMonth() + 1); // Months are zero-based
    const day = padWithZero(now.getDate());
    const hours = padWithZero(now.getHours());
    const minutes = padWithZero(now.getMinutes());
    const seconds = padWithZero(now.getSeconds());
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0'); // Ensure 3 digits for milliseconds

    // Construct the formatted date-time string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const getCurrentEpochTimePlus30Seconds = () => {
    const now = new Date();

    // Add 40 seconds to the current time
    now.setSeconds(now.getSeconds() + 30);

    // Convert to epoch time (milliseconds since Jan 1, 1970)
    const epochTime = now.getTime();

    return epochTime;
  };

  const getCurrentEpochTimeSeconds = () => {
    const now = new Date();

    const epochTime = now.getTime();

    return epochTime;
  };

  const onFindSPonDemand = async () => {
    await AsyncStorage.removeItem('bookingAccepted');

    let _getCurrentDateTime = getCurrentDateTime();
    let _getExpiryDate = getCurrentDateTimePlus30Seconds();
    let _getCurrentEpoch = getCurrentEpochTimeSeconds();
    let _getExpiryEpoch = getCurrentEpochTimePlus30Seconds();

    const payload = {
      Action: 'FindServiceProvider',
      BookingRefNo: bookingRefNo,
      CustomerId: customerId,
      CustomerLatitude: property.latitude,
      CustomerLongitude: property.longitude,
      ServiceType: selectedServiceTypeId,
      CanCollectWaste: grassClippingsValue.value === '1',
      BookingStartDateTime: _getCurrentDateTime,
      BookingExpiryDateTime: _getExpiryDate,
      BoookingStartEpochTime: _getCurrentEpoch,
      BookingExpiryEpochTime: _getExpiryEpoch,
    };

    if (!isProcessing) {
      findSP(
        payload,
        (data: any) => {
          if (data.StatusCode === '00') {
            setWaiting(true);
            setTimeLeft(40); // Reset the timer for retry
            setTimeoutState(false);
            setIsProcessing(true);
          } else {
            onQueryFail();
            setIsProcessing(false);
          }
        },
        (err: any) => {
          console.log('onFindSPonDemand err:', err);
          onFailedAPIcall();
        },
      );
    }
  };

  const onQueryFail = () => {
    // cancel the payment intent

    setWaiting(false); // Stop waiting
    NavigationService.navigate(SCREENS.FAIL, {params});
  };
  const onFailedAPIcall = () => {
    Alert.alert('System call', 'Something went wrong, please try again.', [
      {
        text: 'Confirm',
        onPress: () => {
          NavigationService.push(SCREENS.HOME);
          dispatch(onSetLawnURIList([]));
        },
      },
    ]);
  };

  return null;
};

export default SearchSPFunction;
