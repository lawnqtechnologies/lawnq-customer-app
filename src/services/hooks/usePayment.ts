import {AxiosError} from 'axios';
import {Alert} from 'react-native';
import {useMutation} from 'react-query';
import {
  onCompleteCustomerSetupIntent,
  onCompleteCustomerSetupIntentV2,
  onCreateCustomerWallet,
  onCreatePaymentIntent,
  onCustomerPaymentMethodList,
  onSetIsDefaultCustomerCard,
  onRemoveCustomerCard,
  onCustomerSetupIntent,
  onGetCustomerWalletList,
  onCustomerPaymentKey,
} from '../api/payment.service';

const asAxios = (e: unknown) => e as AxiosError;

export const usePayment = () => {
  const PaymentIntentMutation = useMutation(onCreatePaymentIntent);
  const CreateCustomerWalletMutation = useMutation(onCreateCustomerWallet);
  const GetCustomerWalletListMutation = useMutation(onGetCustomerWalletList);
  const CustomerSetupIntentMutation = useMutation(onCustomerSetupIntent);
  const CompleteCustomerSetupIntentMutation = useMutation(onCompleteCustomerSetupIntent);
  const CompleteCustomerSetupIntentV2Mutation = useMutation(onCompleteCustomerSetupIntentV2);
  const CustomerPaymentMethodListMutation = useMutation(onCustomerPaymentMethodList);
  const SetIsDefaultCustomerCardMutation = useMutation(onSetIsDefaultCustomerCard);
  const RemoveCustomerCardMutation = useMutation(onRemoveCustomerCard);
  const CustomerPaymentKeyMutation = useMutation(onCustomerPaymentKey);

  const createPaymentIntent = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    PaymentIntentMutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => errorCallback?.(asAxios(e)),
    });
  };

  const createCustomerWallet = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    CreateCustomerWalletMutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => errorCallback?.(asAxios(e)),
    });
  };

  const getCustomerWalletList = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    GetCustomerWalletListMutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => errorCallback?.(asAxios(e)),
    });
  };

  const customerSetupIntent = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    CustomerSetupIntentMutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => {
        const err = asAxios(e);
        errorCallback?.(err);
        Alert.alert('Error creating setup intent', (err.response?.data as any)?.Message);
      },
    });
  };

  const completeCustomerSetupIntent = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    CompleteCustomerSetupIntentMutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => {
        const err = asAxios(e);
        errorCallback?.(err);
        Alert.alert('Error completing setup intent', (err.response?.data as any)?.Message);
      },
    });
  };

  const completeCustomerSetupIntentV2 = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    CompleteCustomerSetupIntentV2Mutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => {
        const err = asAxios(e);
        errorCallback?.(err);
        Alert.alert('Error saving card', (err.response?.data as any)?.Message);
      },
    });
  };

  const customerPaymentMethodList = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    CustomerPaymentMethodListMutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => errorCallback?.(asAxios(e)),
    });
  };

  const setIsDefaultCustomerCard = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    SetIsDefaultCustomerCardMutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => errorCallback?.(asAxios(e)),
    });
  };

  const removeCustomerCard = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    RemoveCustomerCardMutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => errorCallback?.(asAxios(e)),
    });
  };

  const customerPaymentKey = (
    payload: any,
    successCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    CustomerPaymentKeyMutation.mutate(payload, {
      onSuccess: data => successCallback?.(data),
      onError: e => errorCallback?.(asAxios(e)),
    });
  };

  return {
    createPaymentIntent,
    createCustomerWallet,
    getCustomerWalletList,
    customerSetupIntent,
    completeCustomerSetupIntent,
    completeCustomerSetupIntentV2,
    customerPaymentMethodList,
    setIsDefaultCustomerCard,
    removeCustomerCard,
    customerPaymentKey,
  };
};
