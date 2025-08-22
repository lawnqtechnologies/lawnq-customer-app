import { AuthenticationObject } from "../models/authentication";
import { nonAuthorizedRequest ,nonAuthorizedMultiPartRequest} from "./client";

export const onSaveCustomerProperty = async (payload: any) => {
  const response = await nonAuthorizedMultiPartRequest<AuthenticationObject>().post(
    `CustomerProperty/SaveCustomerProperty`,
    payload,
  );

  return response.data;
};
export const onUpdateCustomerProperty = async (payload: any) => {
  const response = await nonAuthorizedMultiPartRequest<AuthenticationObject>().put(
    `CustomerProperty/UpdateCustomerProperty`,
    payload,
  );
  return response.data;
};
export const onDeleteCustomerProperty = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().delete(
    `CustomerProperty/DeleteCustomerProperty`,
    payload,
  );
  return response.data;
};
export const onGetCustomerProperties = async (payload: any) => {
  const {
    CustomerToken,
    PropertyId,
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
    `CustomerProperty/CustomerProperty?CustomerToken=${CustomerToken}&PropertyId=${PropertyId}&${devicedetails}`,
  );
  return response.data;
};
