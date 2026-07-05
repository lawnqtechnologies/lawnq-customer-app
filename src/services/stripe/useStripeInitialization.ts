import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import {initStripe} from '@stripe/stripe-react-native';

import {usePayment} from '@services/hooks/usePayment';
import {
  assertStripePublishableKeySafeForCurrentBuild,
  getStripePublishableKey,
  STRIPE_MERCHANT_IDENTIFIER,
  STRIPE_URL_SCHEME,
} from './stripe.helpers';

export const useStripeInitialization = (
  token?: string,
  customerId?: string | number,
) => {
  const {customerPaymentKey} = usePayment();
  const customerPaymentKeyRef = useRef(customerPaymentKey);
  const initPromiseRef = useRef<Promise<boolean> | null>(null);
  const [isStripeReady, setIsStripeReady] = useState(false);

  useEffect(() => {
    customerPaymentKeyRef.current = customerPaymentKey;
  }, [customerPaymentKey]);

  useEffect(() => {
    initPromiseRef.current = null;
    setIsStripeReady(false);
  }, [customerId, token]);

  const ensureStripeInitialized = useCallback(
    (showAlert = true): Promise<boolean> => {
      if (isStripeReady) {
        return Promise.resolve(true);
      }

      if (!token || !customerId) {
        if (showAlert) {
          Alert.alert('Stripe configuration error', 'Customer details are missing.');
        }
        return Promise.resolve(false);
      }

      if (initPromiseRef.current) {
        return initPromiseRef.current;
      }

      initPromiseRef.current = new Promise(resolve => {
        const finish = (isReady: boolean) => {
          setIsStripeReady(isReady);
          initPromiseRef.current = null;
          resolve(isReady);
        };

        customerPaymentKeyRef.current(
          {
            CustomerToken: token,
            CustomerId: customerId,
          },
          async (data: any) => {
            try {
              if (data?.StatusCode !== '00') {
                throw new Error(data?.StatusMessage || 'Stripe key was not returned.');
              }

              const publishableKey = assertStripePublishableKeySafeForCurrentBuild(
                getStripePublishableKey(data),
              );

              await initStripe({
                publishableKey,
                merchantIdentifier: STRIPE_MERCHANT_IDENTIFIER,
                urlScheme: STRIPE_URL_SCHEME,
              });

              finish(true);
            } catch (error: any) {
              if (showAlert) {
                Alert.alert('Stripe configuration error', error.message);
              }
              finish(false);
            }
          },
          (error: any) => {
            if (showAlert) {
              Alert.alert(
                'Stripe configuration error',
                error?.message || 'Unable to load Stripe configuration.',
              );
            }
            finish(false);
          },
        );
      });

      return initPromiseRef.current;
    },
    [customerId, isStripeReady, token],
  );

  return {ensureStripeInitialized, isStripeReady};
};
