import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { initStripe } from "@stripe/stripe-react-native";

import { usePayment } from "@services/hooks/usePayment";
import {
  getSafeStripePublishableKeyForCurrentBuild,
  getStripePublishableKey,
  STRIPE_MERCHANT_IDENTIFIER,
  STRIPE_URL_SCHEME,
} from "./stripe.helpers";

const PAYMENT_SETUP_ERROR_TITLE = "Payment setup issue";
const PAYMENT_SETUP_ERROR_MESSAGE =
  "We couldn't prepare your payment right now. Please try again.";

export const useStripeInitialization = (
  token?: string,
  customerId?: string | number,
) => {
  const { customerPaymentKey } = usePayment();
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
          Alert.alert(PAYMENT_SETUP_ERROR_TITLE, PAYMENT_SETUP_ERROR_MESSAGE);
        }
        return Promise.resolve(false);
      }

      if (initPromiseRef.current) {
        return initPromiseRef.current;
      }

      initPromiseRef.current = new Promise((resolve) => {
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
              if (data?.StatusCode !== "00") {
                if (showAlert) {
                  Alert.alert(
                    PAYMENT_SETUP_ERROR_TITLE,
                    PAYMENT_SETUP_ERROR_MESSAGE,
                  );
                }
                finish(false);
                return;
              }

              const publishableKey = getSafeStripePublishableKeyForCurrentBuild(
                getStripePublishableKey(data),
              );

              if (!publishableKey) {
                if (showAlert) {
                  Alert.alert(
                    PAYMENT_SETUP_ERROR_TITLE,
                    PAYMENT_SETUP_ERROR_MESSAGE,
                  );
                }
                finish(false);
                return;
              }

              await initStripe({
                publishableKey,
                merchantIdentifier: STRIPE_MERCHANT_IDENTIFIER,
                urlScheme: STRIPE_URL_SCHEME,
              });

              finish(true);
            } catch {
              if (showAlert) {
                Alert.alert(
                  PAYMENT_SETUP_ERROR_TITLE,
                  PAYMENT_SETUP_ERROR_MESSAGE,
                );
              }
              finish(false);
            }
          },
          () => {
            if (showAlert) {
              Alert.alert(
                PAYMENT_SETUP_ERROR_TITLE,
                PAYMENT_SETUP_ERROR_MESSAGE,
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

  return { ensureStripeInitialized, isStripeReady };
};
