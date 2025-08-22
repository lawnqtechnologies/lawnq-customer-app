import { DeviceDetailsModel } from '@interface/base/DeviceDetailsModel';

export interface UpdateCustomerDeviceIdRequest {
  customerToken: string;
  customerId: number;
  deviceId: string;
  deviceDetails: DeviceDetailsModel;
}
