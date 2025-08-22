import { useRef } from "react";
import { AxiosError } from "axios";
import { useMutation } from "react-query";

import {
  onGetPathConversationId,
  onCreateConversationMutation,
  onCreateConvoMessage,
  onListAllConvo,
} from "../api/twilio.service";

export const useTwilio = () => {
  const successCallbackRef = useRef<(a: object) => void>();
  const errorCallbackRef = useRef<(a: any) => void>();

  // Fetch PathConversationId
  const getConversationIdMutation = useMutation(onGetPathConversationId, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const getPathConversationId = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    getConversationIdMutation.mutate(payload);
  };

  // Create Conversation
  const createConversationMutation = useMutation(onCreateConversationMutation, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const createConversation = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    createConversationMutation.mutate(payload);
  };

  // Send a Message to Conversation
  const createConversationMessageMutation = useMutation(onCreateConvoMessage, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const createConversationMessage = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    createConversationMessageMutation.mutate(payload);
  };

  // Get all Message from a Conversation
  const listAllConvoMutation = useMutation(onListAllConvo, {
    onSuccess: (data: any) => {
      return successCallbackRef.current?.(data);
    },
    onError: (err: AxiosError) => {
      errorCallbackRef.current?.(err);
    },
  });
  const listAllConvo = (
    payload: any,
    succesCallback?: (p: object) => void,
    errorCallback?: (p: object) => void,
  ) => {
    successCallbackRef.current = succesCallback;
    errorCallbackRef.current = errorCallback;
    listAllConvoMutation.mutate(payload);
  };

  return {
    getPathConversationId,
    createConversation,
    createConversationMessage,
    listAllConvo,
  };
};
