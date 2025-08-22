import {AuthenticationObject} from '@services/models/authentication';
import {CreatePaymentIntentRequest} from '@services/models/payment';
import {nonAuthorizedRequest} from './client';

export const onCreatePaymentIntent = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerTransaction/CreatePaymentIntent`,
    payload,
  );
  return response.data;
};
export const onCreateCustomerWallet = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerWallet/CreateCustomerWallet`,
    payload,
  );
  return response.data;
};

export const onCustomerSetupIntent = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerWallet/CustomerSetupIntent`,
    payload,
  );
  return response.data;
};

export const onCompleteCustomerSetupIntent = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerWallet/CompleteCustomerSetupIntent`,
    payload,
  );
  return response.data;
};

export const onCustomerPaymentMethodList = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerWallet/CustomerPaymentMethodList`,
    payload,
  );
  return response.data;
};

export const onCustomerPaymentKey = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerWallet/CustomerPaymentKey`,
    payload,
  );
  return response.data;
};

export const onSetIsDefaultCustomerCard = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerWallet/SetIsDefaultCustomerCard`,
    payload,
  );
  return response.data;
};

export const onRemoveCustomerCard = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `CustomerWallet/RemoveCustomerCard`,
    payload,
  );
  return response.data;
};

export const onGetCustomerWalletList = async (payload: any) => {
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
    `CustomerWallet/CustomerWalletList?CustomerToken=${CustomerToken}&CustomerId=${CustomerId}&${devicedetails}`,
  );
  return response.data;
};
