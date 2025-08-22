import { useRef } from "react";
import { AxiosError } from "axios";
import { useMutation } from "react-query";

import { onSaveNotificationLogs } from "../api/system.service";

export const useSystem = () => {
  const successCallbackRef = useRef<(a: object) => void>();
  const errorCallbackRef = useRef<(a: any) => void>();

  // Save Notification Logs
  const saveNotificationLogsMutation = useMutation(onSaveNotificationLogs, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const saveNotificationLogs = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    saveNotificationLogsMutation.mutate(payload);
  };

  return {
    saveNotificationLogs,
  };
};
