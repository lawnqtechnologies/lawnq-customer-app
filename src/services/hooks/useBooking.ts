import {useRef} from 'react';
import {AxiosError} from 'axios';
import {useMutation} from 'react-query';
import * as NavigationService from 'react-navigation-helpers';

import {
  onGetBookingIntervalServiceTime,
  onGetBookingServiceType,
  onGetServiceFee,
  onSaveBooking,
  onFindSP,
  onSendNotification,
  onGetBookingHistory,
  onSaveFeedback,
  onGetRideOnMowingPricing,
  onFindSPQueueLater,
  onSaveScheduledBooking,
  onGetSPDeviceInfo,
  onGetGrassLengthList,
  onGetMowLengthList,
  onCustomerCancelBooking,
  onRescheduleBooking,
  onDisputeBooking,
  onUpdateProfilePhoto,
  onGetReceipt,
  onGetAvailableSchduleDates,
  onAssignServiceProviderToBookLater,
} from '../api/booking.service';
import {useDispatch} from 'react-redux';
import {
  onSetBookingIntervalServiceTime,
  onSetBookingServiceType,
} from '@services/states/booking/booking.slice';
import {Alert} from 'react-native';
import {SCREENS} from 'constant';

export const useBooking = () => {
  const dispatch = useDispatch();

  const successCallbackRef = useRef<(a: object) => void>();
  const errorCallbackRef = useRef<(a: any) => void>();

  const bookingIntervalServiceTimeMutation = useMutation(
    onGetBookingIntervalServiceTime,
    {
      onSuccess: (data: any) => {
        dispatch(onSetBookingIntervalServiceTime(data[0].Data));
        return successCallbackRef.current?.(data);
      },
      onError: (err: AxiosError) => {
        errorCallbackRef.current?.(err);
      },
    },
  );
  const getBookingIntervalServiceTime = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    bookingIntervalServiceTimeMutation.mutate(payload);
  };

  // ? Get Booking Service Type
  const bookingServiceTypeMutation = useMutation(onGetBookingServiceType, {
    onSuccess: (data: any) => {
      dispatch(onSetBookingServiceType(data[0].Data));
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const getBookingServiceType = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    bookingServiceTypeMutation.mutate(payload);
  };

  // ? Get Booking Service Fee
  const getServiceFeeMutation = useMutation(onGetServiceFee, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const getServiceFee = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getServiceFeeMutation.mutate(payload);
  };

  // ? Save Booking
  const saveBookingMutation = useMutation(onSaveBooking, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const saveBooking = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    saveBookingMutation.mutate(payload);
  };

  // ? Find Service Provider
  const findMutation = useMutation(onFindSP, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const findSP = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    findMutation.mutate(payload);
  };

  // ? send notification to service provider
  const sendNotificationMutation = useMutation(onSendNotification, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const sendNotification = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    sendNotificationMutation.mutate(payload);
  };

  // ? get booking history (per booking reference number or all) legend: pass empty BookingRefNo: "" to get all bookings
  const getBookingHistoryMutation = useMutation(onGetBookingHistory, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      Alert.alert(
        'Oops',
        'Something went wrong. Please try again later.',
        [
          {
            text: 'Add',
            onPress: () => NavigationService.navigate(SCREENS.HOME),
          },
          // {text: 'Cancel', style: 'cancel'},
        ],
        {cancelable: false},
      );
      errorCallbackRef.current?.(err);
    },
  });

  const getBookingHistory = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getBookingHistoryMutation.mutate(payload);
  };

  // ? Saves rating and feedback
  const saveFeedbackMutation = useMutation(onSaveFeedback, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const saveFeedback = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    saveFeedbackMutation.mutate(payload);
  };

  // ? Saves rating and feedback
  const getRideOnMowingPricingMutation = useMutation(onGetRideOnMowingPricing, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const getRideOnMowingPricing = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getRideOnMowingPricingMutation.mutate(payload);
  };

  // ? Saves rating and feedback
  const findSPQueueLaterMutation = useMutation(onFindSPQueueLater, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const findSPQueueLater = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    findSPQueueLaterMutation.mutate(payload);
  };

  // ? Saves rating and feedback
  const saveScheduledBookingMutation = useMutation(onSaveScheduledBooking, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const saveScheduledBooking = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    saveScheduledBookingMutation.mutate(payload);
  };

  // ? Gets the device id and other information of the service provider
  const getSPDeviceInfoMutation = useMutation(onGetSPDeviceInfo, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const getSPDeviceInfo = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getSPDeviceInfoMutation.mutate(payload);
  };

  const getReceipt = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getReceiptMutation.mutate(payload);
  };
  // ? Gets the grass lengths
  const getReceiptMutation = useMutation(onGetReceipt, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  // ? Gets the grass lengths
  const getGrassLengthListMutation = useMutation(onGetGrassLengthList, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const getGrassLengthList = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getGrassLengthListMutation.mutate(payload);
  };

  // ? Get Available Booking Scdule
  const getAvailableScheduleListMutation = useMutation(
    onGetAvailableSchduleDates,
    {
      onSuccess: (data: any) => {
        return successCallbackRef.current?.(data);
      },
      onError: (err: AxiosError) => {
        errorCallbackRef.current?.(err);
      },
    },
  );

  const getAvailableSchedule = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getAvailableScheduleListMutation.mutate(payload);
  };

  // ? Gets the mow lengths
  const _20successCallbackRef = useRef<(a: object) => void>();
  const _20errorCallbackRef = useRef<(a: any) => void>();

  const getMowLengthListMutation = useMutation(onGetMowLengthList, {
    onSuccess: (data: any) => {
      return _20successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      _20errorCallbackRef.current?.(err);
    },
  });

  const getMowLengthList = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    _20successCallbackRef.current = succesCallback;
    _20errorCallbackRef.current = errorCallback;
    getMowLengthListMutation.mutate(payload);
  };

  const customerCancelBookingMutation = useMutation(onCustomerCancelBooking, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const customerCancelBooking = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    customerCancelBookingMutation.mutate(payload);
  };

  // ? Reschedule booking
  const rescheduleBookingMutation = useMutation(onRescheduleBooking, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const rescheduleBooking = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    rescheduleBookingMutation.mutate(payload);
  };
  // ? Dispute booking
  const disputeBookingMutation = useMutation(onDisputeBooking, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const updateProfilePhotoMutation = useMutation(onUpdateProfilePhoto, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const updateProfilePhoto = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    updateProfilePhotoMutation.mutate(payload);
  };

  const disputeBooking = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    disputeBookingMutation.mutate(payload);
  };

  // ? Saves rating and feedback
  const assignServiceProviderToBookLaterMutation = useMutation(
    onAssignServiceProviderToBookLater,
    {
      onSuccess: (data: any) => {
        return successCallbackRef.current?.(data);
      },
      onError: (err: AxiosError) => {
        errorCallbackRef.current?.(err);
      },
    },
  );

  const assignServiceProviderToBookLater = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    assignServiceProviderToBookLaterMutation.mutate(payload);
  };

  return {
    getBookingIntervalServiceTime,
    getBookingServiceType,
    saveBooking,
    findSP,
    getServiceFee,
    sendNotification,
    getBookingHistory,
    saveFeedback,
    getRideOnMowingPricing,
    findSPQueueLater,
    saveScheduledBooking,
    getSPDeviceInfo,
    getGrassLengthList,
    getMowLengthList,
    customerCancelBooking,
    rescheduleBooking,
    disputeBooking,
    getReceipt,
    updateProfilePhoto,
    getAvailableSchedule,
    assignServiceProviderToBookLater,
  };
};
