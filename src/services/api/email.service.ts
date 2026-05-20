import { nonAuthorizedRequest } from "./client";

export interface SendEmailPayload {
  To: string;
  Subject: string;
  HtmlContent: string;
  PlainText: string;
  SenderType: string;
  SenderName: string;
}

export const onSendEmail = async (payload: SendEmailPayload) => {
  const response = await nonAuthorizedRequest<any>().post(
    "Email/Send",
    payload,
  );

  return response.data;
};
