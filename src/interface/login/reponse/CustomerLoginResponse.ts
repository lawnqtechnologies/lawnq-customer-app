import { BaseResponse } from '@interface/base/BaseReponse';

export type CustomerLoginResponse = CustomerAuthData[];

export interface CustomerAuthData extends BaseResponse {
  data: CustomerTokenData[];
}

export interface CustomerTokenData {
  customerToken: string;
  customerId: string;
}
