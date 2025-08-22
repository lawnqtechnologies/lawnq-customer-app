import { AuthenticationObject } from "../models/authentication";
import { nonAuthorizedRequest } from "./client";

export const onGetPathConversationId = async (payload: any) => {
  const { BookingRefNo } = payload;

  const response = await nonAuthorizedRequest<AuthenticationObject>().get(
    `TwilioChat/PathConversationSid?BookingRefNo=${BookingRefNo}`,
  );
  return response.data;
};

export const onCreateConversationMutation = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `TwilioChat/CreateConvo`,
    payload,
  );
  return response.data;
};

export const onCreateConvoMessage = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `TwilioChat/CreateConvoMessage`,
    payload,
  );
  return response.data;
};

export const onListAllConvo = async (payload: any) => {
  const { PathConversationSid } = payload;

  const response = await nonAuthorizedRequest<AuthenticationObject>().get(
    `TwilioChat/ListAllConvo?PathConversationSid=${PathConversationSid}`,
  );
  return response.data;
};
