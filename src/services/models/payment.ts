export interface CreatePaymentIntentRequest {
    Amount: any
}

export interface CreatePaymentIntentResponse {
    StatusCode: string
    StatusMessage: string
    ClientSecret: string
}

export interface CustomerPaymentInfo {
  Last4: string;
  ExpMonth: number;
  ExpYear: number;
  Fingerprint: string;
  CustomerStripeId: string;
  CustomerStripePaymentId: string;
  Brand: string;
  IsDefault: number;
}

 export interface ICustomerPaymentInfo {
  Last4: string;
  ExpMonth: number;
  ExpYear: number;
  Fingerprint: string;
  CustomerStripeId: string;
  CustomerStripePaymentId: string;
  Brand: string;
  IsDefault: number;
}

