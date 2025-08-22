import { AuthenticationObject } from "../models/authentication";
import { nonAuthorizedRequest } from "./client";

export const onSaveNotificationLogs = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `Notification/SaveNotificationLogs`,
    payload
  );
  return response.data;
};
