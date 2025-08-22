import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import * as NavigationService from 'react-navigation-helpers';

/**
 * ? Local Imports
 */
import {NOTIFICATION_SOUNDS, SCREENS} from '@shared-constants';
import {useBooking} from '@services/hooks/useBooking';
import {useFocusEffect} from '@react-navigation/native';
import {Alert} from 'react-native';
import {useSystem} from '@services/hooks/useSystem';
import {RootState} from 'store';
import {onSetLawnURIList} from '@services/states/booking/booking.slice';

/**
 * ? Constants
 */
//const TIMER = 7000; // 7 seconds

interface ISearchScheduleSPFunctionProps {
  params: any;
}

const SearchScheduleSPFunction: React.FC<ISearchScheduleSPFunctionProps> = ({
  params,
}) => {
  const dispatch = useDispatch();

  /**
  |--------------------------------------------------
  | Hooks
  |--------------------------------------------------
  */
  const {assignServiceProviderToBookLater} = useBooking();

  /**
  |--------------------------------------------------
  | Redux States
  |--------------------------------------------------
  */
  const {customerId, token} = useSelector((state: RootState) => state.user);
  const {bookingRefNo} = useSelector((state: RootState) => state.booking);

  /**
  |--------------------------------------------------
  | States
  |--------------------------------------------------
  */
  useFocusEffect(
    useCallback(() => {
      findSPasScheduled();
    }, []),
  );

  /**
  |--------------------------------------------------
  | API CALL
  |--------------------------------------------------
  */

  const findSPasScheduled = () => {
    console.log('payload findSPasScheduled');

    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      BookingRefNo: bookingRefNo,
    };

    console.log(payload);

    assignServiceProviderToBookLater(
      payload,
      (data: any) => {
        setTimeout(() => {
          if (data.StatusCode === '01') return onQueryFail();
          if (data.StatusCode === '00') return onQuerySuccess();
        }, 500);
      },
      (err: any) => {
        onFailedAPIcall();
      },
    );
  };

  const onQuerySuccess = () => {
    dispatch(onSetLawnURIList([]));
    NavigationService.navigate(SCREENS.SUCCESS_SCHEDULE);
  };

  const onQueryFail = () => {
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

export default SearchScheduleSPFunction;
