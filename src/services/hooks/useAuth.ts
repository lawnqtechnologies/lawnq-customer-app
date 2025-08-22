import {useRef} from 'react';
import {Alert} from 'react-native';
import {AxiosError} from 'axios';
import {useMutation} from 'react-query';
import {Signin, Signup, UpdateDeviceId} from '../models/authentication';
import {MobileProps} from '../models/system';

import {AUTHENTICATION} from '@shared-constants';
const {TOKEN} = AUTHENTICATION;
import {
  onLogin,
  onSignup,
  onGetCustomerInfo,
  onUpdateCustomerInfo,
  onUpdateCustomerEmailInfo,
  onUpdateDeviceId,
  onUpdateCustomerPassword,
  onSendOTP,
  onValidateOTP,
  onDeleteCustomerInfo,
  onCustomerAppVersion,
  onValidate,
  onSaveRegistration,
} from '../api/user.service';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onSetCustomerInfo,
  userLoggedOut,
} from '@services/states/user/user.slice';

export const useAuth = () => {
  const dispatch = useDispatch();

  const successCallbackRef = useRef<(a: object) => void>();
  const errorCallbackRef = useRef<(a: object) => void>();

  const loginMutation = useMutation(onLogin, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
      // Alert.alert("Sign In Error", err.response?.data.Message);
    },
  });
  const login = (
    payload: Signin | MobileProps,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    loginMutation.mutate(payload);
  };

  // registration
  const registerMutation = useMutation(onSignup, {
    onSuccess: (data: any) => {
      if (data.StatusCode !== '00') {
        let errorArray: any = [];

        data.map((d: any) => {
          if (d.StatusCode !== '00') {
            errorArray.push(d.StatusMessage);
          }
        });
        return successCallbackRef.current?.(errorArray);
      }

      Alert.alert('Success', 'Sign Up Successful', [
        {
          text: 'Confirm',
          onPress: () => {
            successCallbackRef.current?.(data);
          },
        },
      ]);
    },
    onError: (err: AxiosError) => {
      console.log('error', err.response?.data);
      errorCallbackRef.current?.(err);
      // Alert.alert("Sign Up Error", err.response?.data.Message);
    },
  });
  const register = (
    payload: Signup | MobileProps,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    registerMutation.mutate(payload);
  };

  // validate registration
  const validateMutation = useMutation(onValidate, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const validateRegistration = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    validateMutation.mutate(payload);
  };

  // save registration
  const saveRegistrationMutation = useMutation(onSaveRegistration, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const saveRegistration = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    saveRegistrationMutation.mutate(payload);
  };

  const getCustomerInfoMutation = useMutation(onGetCustomerInfo, {
    onSuccess: (data: any) => {
      dispatch(onSetCustomerInfo(data[0].Data[0]));
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
      // Alert.alert("Fetch error onGetCustomerInfo", err.response?.data.Message);
    },
  });
  const getCustomerInfo = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: () => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getCustomerInfoMutation.mutate(payload);
  };
  const getCustomer = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: () => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getCustomerInfoMutation.mutate(payload);
  };
  const updateCustomerInfoMutation = useMutation(onUpdateCustomerInfo, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
      // Alert.alert(
      //   "Update Error onUpdateCustomerInfo",
      //   err.response?.data.Message,
      // );
    },
  });
  const updateCustomerEmailInfoMutation = useMutation(
    onUpdateCustomerEmailInfo,
    {
      onSuccess: (data: any) => {
        return successCallbackRef.current?.(data);
      },
      onError: (err: AxiosError) => {
        errorCallbackRef.current?.(err);
        // Alert.alert(
        //   "Update Error onUpdateCustomerEmailInfo",
        //   err.response?.data.Message,
        // );
      },
    },
  );
  const updateCustomerPasswordMutation = useMutation(onUpdateCustomerPassword, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
      // Alert.alert(
      //   "Update Error onUpdateCustomerEmailInfo",
      //   err.response?.data.Message,
      // );
    },
  });
  const updateCustomerInfo = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: () => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    updateCustomerInfoMutation.mutate(payload);
  };

  const updateCustomerEmailInfo = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: () => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    updateCustomerEmailInfoMutation.mutate(payload);
  };

  const updateCustomerPassword = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: () => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    updateCustomerPasswordMutation.mutate(payload);
  };

  const updateDeviceIdMutation = useMutation(onUpdateDeviceId, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const updateDeviceId = (
    payload: UpdateDeviceId | MobileProps,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    updateDeviceIdMutation.mutate(payload);
  };

  const sendOTPmutation = useMutation(onSendOTP, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const sendOTP = (
    payload: UpdateDeviceId | MobileProps,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    sendOTPmutation.mutate(payload);
  };

  const validateOTPmutation = useMutation(onValidateOTP, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const validateOTP = (
    payload: UpdateDeviceId | MobileProps,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    validateOTPmutation.mutate(payload);
  };

  const deleteCustomerInfoMutation = useMutation(onDeleteCustomerInfo, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });

  const deleteCustomerInfo = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    deleteCustomerInfoMutation.mutate(payload);
    // AsyncStorage.removeItem(TOKEN);
    // dispatch(userLoggedOut());
  };

  // get app version validation
  const customerAppVersionMutation = useMutation(onCustomerAppVersion, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
      // Alert.alert('Fetch error onGetCustomerInfo', err);
    },
  });

  const customerAppVersion = (
    payload: any,
    succesCallback?: (p: any) => void,
    errorCallback?: (p: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    customerAppVersionMutation.mutate(payload);
  };

  const logout = () => {
    AsyncStorage.removeItem(TOKEN);
    dispatch(userLoggedOut());
  };

  return {
    login,
    register,
    getCustomerInfo,
    updateCustomerInfo,
    updateDeviceId,
    sendOTP,
    validateOTP,
    logout,
    updateCustomerEmailInfo,
    deleteCustomerInfo,
    updateCustomerPassword,
    customerAppVersion,
    validateRegistration,
    saveRegistration,
  };
};
