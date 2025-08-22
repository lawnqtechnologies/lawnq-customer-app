import { useRef } from "react";
import { AxiosError } from "axios";
import { useMutation } from "react-query";

import {
  onSaveCustomerProperty,
  onUpdateCustomerProperty,
  onGetCustomerProperties,
  onDeleteCustomerProperty,
} from "../api/property.service";

export const useProperty = () => {
  const successCallbackRef = useRef<(a: object) => void>();
  const errorCallbackRef = useRef<(a: any) => void>();

  const saveCustomerPropertyMutation = useMutation(onSaveCustomerProperty, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const saveCustomerProperty = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: () => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    saveCustomerPropertyMutation.mutate(payload);
  };

  const updateCustomerPropertyMutation = useMutation(onUpdateCustomerProperty, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const updateCustomerProperty = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: () => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    updateCustomerPropertyMutation.mutate(payload);
  };

  const deleteCustomerPropertyMutation = useMutation(onDeleteCustomerProperty, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const deleteCustomerProperty = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    deleteCustomerPropertyMutation.mutate(payload);
  };

  // gets customer properties (1 property or all) -note: pass 0 to PropertyId to get all
  const getCustomerPropertiesMutation = useMutation(onGetCustomerProperties, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const getCustomerProperties = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (a: any) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getCustomerPropertiesMutation.mutate(payload);
  };

  return {
    saveCustomerProperty,
    updateCustomerProperty,
    deleteCustomerProperty,
    getCustomerProperties,
  };
};
