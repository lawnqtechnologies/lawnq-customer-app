import {
  AuthenticationObject,
  Signin,
  Signup,
  UpdateDeviceId,
} from '../models/authentication';
import {MobileProps} from '../models/system';
import {nonAuthorizedRequest} from './client';

export const onLogin = async (payload: Signin | MobileProps) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerLogin/CustomerLogin`,
    payload,
  );
  return response.data;
};

export const onSignup = async (payload: Signup | MobileProps) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerRegistration/SaveCustomerRegistration`,
    payload,
  );
  return response.data;
};
export const onValidate = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerRegistration/ValidateCustomerRegistration`,
    payload,
  );
  return response.data;
};

export const onSaveRegistration = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerRegistration/RegisterCustomerInfoAddress`,
    payload,
  );
  return response.data;
};
export const onGetCustomerInfo = async (payload: any) => {
  const {
    CustomerToken,
    CustomerId,
    AppVersion,
    Platform,
    PlatformOs,
    DeviceVersion,
    DeviceModel,
    IpAddress,
    MacAddress,
  } = payload;

  const devicedetails = `DeviceDetails.AppVersion=${AppVersion}&DeviceDetails.Platform=${Platform}&DeviceDetails.PlatformOs=${PlatformOs}&DeviceDetails.DeviceVersion=${DeviceVersion}&DeviceDetails.DeviceModel=${DeviceModel}&DeviceDetails.IpAddress=${IpAddress}&DeviceDetails.MacAddress=${MacAddress}`;

  const response = await nonAuthorizedRequest<AuthenticationObject>().get(
    `Customer/CustomerInfo?CustomerToken=${CustomerToken}&CustomerId=${CustomerId}&${devicedetails}`,
  );
  return response.data;
};

export const onUpdateCustomerInfo = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().put(
    `Customer/UpdateCustomerPersonalInformation`,
    payload,
  );
  return response.data;
};

export const onUpdateCustomerEmailInfo = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().put(
    `Customer/UpdateCustomerEmailAddress`,
    payload,
  );
  return response.data;
};

export const onUpdateCustomerPassword = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerLogin/CustomerResetPassword`,
    payload,
  );
  return response.data;
};
export const onUpdateDeviceId = async (
  payload: UpdateDeviceId | MobileProps,
) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().put(
    `Customer/UpdateCustomerDeviceId`,
    payload,
  );
  return response.data;
};

export const onSendOTP = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `Otp/SendOtp`,
    payload,
  );
  return response.data;
};

export const onValidateOTP = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `Otp/ValidateOtp`,
    payload,
  );
  return response.data;
};

export const onDeleteCustomerInfo = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `Customer/DeleteCustomerInfo`,
    payload,
  );
  return response.data;
};

export const onCustomerAppVersion = async (payload: any) => {
  const {CustomerId, CustomerToken} = payload;

  const response = await nonAuthorizedRequest<AuthenticationObject>().get(
    `Customer/CustomerAppVersion?CustomerToken=${CustomerToken}&CustomerId=${CustomerId}`,
  );
  return response.data;
};
