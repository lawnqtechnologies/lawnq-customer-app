import {CreatePaymentIntentRequest} from '@services/models/payment';
import {AxiosError} from 'axios';
import {useRef} from 'react';
import {Alert} from 'react-native';
import {useMutation} from 'react-query';
import {
  onCompleteCustomerSetupIntent,
  onCreateCustomerWallet,
  onCreatePaymentIntent,
  onCustomerPaymentMethodList,
  onSetIsDefaultCustomerCard,
  onRemoveCustomerCard,
  onCustomerSetupIntent,
  onGetCustomerWalletList,
  onCustomerPaymentKey,
} from '../api/payment.service';

export const usePayment = () => {
  //---------------------------------------------//
  // CONSTANTS
  //--------------------------------------------//
  const successCallbackRef = useRef<(a: object) => void>();
  const errorCallbackRef = useRef<(a: any) => void>();

  //---------------------------------------------//
  // MUTATIONS
  //--------------------------------------------//

  const PaymentIntentMutation = useMutation(onCreatePaymentIntent, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
      Alert.alert('Sign In Error', err.response?.data.Message);
    },
  });

  const CreateCustomerWalletMutation = useMutation(onCreateCustomerWallet, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
      Alert.alert(
        'error during creating of wallet',
        err.response?.data.Message,
      );
    },
  });

  const GetCustomerWalletListMutation = useMutation(onGetCustomerWalletList, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const CustomerSetupIntentMutation = useMutation(onCustomerSetupIntent, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
      Alert.alert(
        'error during creating of wallet',
        err.response?.data.Message,
      );
    },
  });
  const CompleteCustomerSetupIntentMutation = useMutation(
    onCompleteCustomerSetupIntent,
    {
      onSuccess: (data: any) => {
        return successCallbackRef.current?.(data);
      },
      onError: (err: AxiosError) => {
        errorCallbackRef.current?.(err);
        Alert.alert(
          'error during creating of wallet',
          err.response?.data.Message,
        );
      },
    },
  );

  const _2successCallbackRef = useRef<(a: object) => void>();
  const _2errorCallbackRef = useRef<(a: any) => void>();

  const CustomerPaymentMethodListMutation = useMutation(
    onCustomerPaymentMethodList,
    {
      onSuccess: (data: any) => {
        return _2successCallbackRef.current?.(data);
      },
      onError: (err: AxiosError) => {
        _2errorCallbackRef.current?.(err);
        // Alert.alert("error rendering list of wallet", err.response?.data.Message);
      },
    },
  );

  const setIsDefaultCustomerCardMutation = useMutation(
    onSetIsDefaultCustomerCard,
    {
      onSuccess: (data: any) => {
        return _3successCallbackRef.current?.(data);
      },
      onError: (err: AxiosError) => {
        _3errorCallbackRef.current?.(err);
      },
    },
  );

  const removeCustomerCardMutation = useMutation(onRemoveCustomerCard, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const customerPaymentKeyMutation = useMutation(onCustomerPaymentKey, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  //---------------------------------------------//
  // METHOD TO BE GET ON SCREENS
  //--------------------------------------------//

  const createPaymentIntent = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    PaymentIntentMutation.mutate(payload);
  };

  const createCustomerWallet = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    CreateCustomerWalletMutation.mutate(payload);
  };

  const getCustomerWalletList = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    GetCustomerWalletListMutation.mutate(payload);
  };

  const customerSetupIntent = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    CustomerSetupIntentMutation.mutate(payload);
  };
  const completeCustomerSetupIntent = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    CompleteCustomerSetupIntentMutation.mutate(payload);
  };
  const customerPaymentMethodList = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    _2successCallbackRef.current = succesCallback;
    _2errorCallbackRef.current = errorCallback;
    CustomerPaymentMethodListMutation.mutate(payload);
  };

  const _3successCallbackRef = useRef<(a: object) => void>();
  const _3errorCallbackRef = useRef<(a: any) => void>();
  const setIsDefaultCustomerCard = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    _3successCallbackRef.current = succesCallback;
    _3errorCallbackRef.current = errorCallback;
    setIsDefaultCustomerCardMutation.mutate(payload);
  };
  const removeCustomerCard = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    removeCustomerCardMutation.mutate(payload);
  };

  const customerPaymentKey = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    customerPaymentKeyMutation.mutate(payload);
  };

  return {
    createPaymentIntent,
    createCustomerWallet,
    getCustomerWalletList,
    customerSetupIntent,
    completeCustomerSetupIntent,
    customerPaymentMethodList,
    setIsDefaultCustomerCard,
    removeCustomerCard,
    customerPaymentKey,
  };
};
