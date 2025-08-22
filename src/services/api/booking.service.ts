import {AuthenticationObject} from '../models/authentication';
import {nonAuthorizedRequest, nonAuthorizedMultiPartRequest} from './client';
import {getDeviceDetails} from '../../utils/helpers';

export const onGetBookingIntervalServiceTime = async (payload: any) => {
  const {
    CustomerToken,
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
    `Booking/BookingIntevalServiceTime?CustomerToken=${CustomerToken}&${devicedetails}`,
  );
  return response.data;
};
export const onGetReceipt = async (payload: any) => {
  const {BookingRefNo} = payload;
  const response = await nonAuthorizedRequest<AuthenticationObject>().get(
    `BookingService/GetBookingReceipt?BookingRefNo=${BookingRefNo}`,
  );
  return response.data;
};

export const onGetBookingServiceType = async (payload: any) => {
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
    `Booking/BookingServiceType?CustomerToken=${CustomerToken}&CustomerId=${CustomerId}&${devicedetails}`,
  );
  return response.data;
};

export const onGetServiceFee = async (payload: any) => {
  const {
    CustomerToken,
    BookingIntervalTimeServiceId,
    BookingServiceId,
    BookingLawnAreaId,
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
    `Booking/BookingServiceFee?CustomerToken=${CustomerToken}&BookingIntervalTimeServiceId=${BookingIntervalTimeServiceId}&BookingServiceId=${BookingServiceId}&BookingLawnAreaId=${BookingLawnAreaId}&${devicedetails}`,
  );
  return response.data;
};

export const onSaveBooking = async (payload: any) => {
  const response =
    await nonAuthorizedMultiPartRequest<AuthenticationObject>().post(
      `BookingService/SaveBookingService`,
      payload,
    );
  return response.data;
};

export const onFindSP = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `BookingService/FindServiceProvider`,
    payload,
  );
  return response.data;
};

export const onSendNotification = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `Notification/PushNotification`,
    payload,
  );
  return response.data;
};

export const onGetBookingHistory = async (payload: any) => {
  const {CustomerId, BookingRefNo} = payload;

  const deviceDetails = getDeviceDetails(payload);

  const response = await nonAuthorizedRequest<AuthenticationObject>().get(
    `BookingService/CustomerBookingHistory?CustomerId=${CustomerId}&BookingRefNo=${BookingRefNo}&${deviceDetails}`,
  );
  return response.data;
};

export const onSaveFeedback = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `BookingService/SaveCustomerFeedback`,
    payload,
  );
  return response.data;
};

export const onGetRideOnMowingPricing = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `MowingService/ComputeMowingPrice`,
    payload,
  );
  return response.data;
};

export const onFindSPQueueLater = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `BookingService/FindServiceProviderQueueLater`,
    payload,
  );
  return response.data;
};

export const onSaveScheduledBooking = async (payload: any) => {
  const response =
    await nonAuthorizedMultiPartRequest<AuthenticationObject>().post(
      `BookingService/SaveBookingServiceQueueLater`,
      payload,
    );
  return response.data;
};

export const onGetSPDeviceInfo = async (payload: any) => {
  const {
    ServiceProviderId,
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
    `ServiceProvider/ServiceProviderDeviceId?ServiceProviderId=${ServiceProviderId}&${devicedetails}`,
  );
  return response.data;
};

export const onGetGrassLengthList = async (payload: any) => {
  const {
    CustomerId,
    CustomerToken,
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
    `Booking/GrassLength?CustomerId=${CustomerId}&CustomerToken=${CustomerToken}&${devicedetails}`,
  );
  return response.data;
};

export const onGetAvailableSchduleDates = async (payload: any) => {
  const {CustomerId, CustomerToken, AddressId} = payload;

  // const devicedetails = `DeviceDetails.AppVersion=${AppVersion}&DeviceDetails.Platform=${Platform}&DeviceDetails.PlatformOs=${PlatformOs}&DeviceDetails.DeviceVersion=${DeviceVersion}&DeviceDetails.DeviceModel=${DeviceModel}&DeviceDetails.IpAddress=${IpAddress}&DeviceDetails.MacAddress=${MacAddress}`;

  const response = await nonAuthorizedRequest<AuthenticationObject>().get(
    `Booking/GetScheduleBookingAvailableDates?CustomerToken=${CustomerToken}&CustomerId=${CustomerId}&AddressId=${AddressId}`,
  );
  // console.log(response.data);
  return response.data;
};

export const onGetMowLengthList = async (payload: any) => {
  const {
    CustomerId,
    CustomerToken,
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
    `Booking/MowLength?CustomerId=${CustomerId}&CustomerToken=${CustomerToken}&${devicedetails}`,
  );
  return response.data;
};

export const onCustomerCancelBooking = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `BookingService/CustomerCancelbooking`,
    payload,
  );
  return response.data;
};

export const onRescheduleBooking = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `BookingService/RescheduleBooking`,
    payload,
  );
  return response.data;
};

export const onDisputeBooking = async (payload: any) => {
  const response =
    await nonAuthorizedMultiPartRequest<AuthenticationObject>().post(
      `BookingService/CustomerDisputeBooking`,
      payload,
    );
  return response.data;
};

export const onUpdateProfilePhoto = async (payload: any) => {
  const response =
    await nonAuthorizedMultiPartRequest<AuthenticationObject>().put(
      `Customer/UpdateCustomerProfilePicture`,
      payload,
    );

  return response.data;
};

export const onAssignServiceProviderToBookLater = async (payload: any) => {
  const response = await nonAuthorizedRequest<AuthenticationObject>().post(
    `BookingService/AssignServiceProviderToBookLater`,
    payload,
  );
  return response.data;
};
