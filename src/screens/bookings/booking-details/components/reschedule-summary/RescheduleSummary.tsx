import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleProp,
  ViewStyle,
  Pressable,
  Alert,
  Vibration,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Modal from "react-native-modal";
import GestureRecognizer from "react-native-swipe-gestures";
import * as NavigationService from "react-navigation-helpers";
import { useDispatch, useSelector } from "react-redux";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import * as Progress from "react-native-progress";

/**
 * ? Local imports
 */
import createStyles from "./RescheduleSummary.style";
import Text from "@shared-components/text-wrapper/TextWrapper";
import CommonButton from "@shared-components/buttons/CommonButton";
import { SCREENS } from "@shared-constants";
import { v2Colors } from "@theme/themes";

import { useBooking } from "@services/hooks/useBooking";

/**
 * ? SVGs
 */
import Calendar from "@assets/v2/homescreen/icons/calendar.svg";
import HouseProperty from "@assets/v2/homescreen/icons/house-property.svg";
import MowerGreen from "@assets/v2/homescreen/icons/mower-green.svg";

import VISA from "@assets/v2/payment/images/cards-illustration.svg";
import CHEVRON_RIGHT from "@assets/v2/list/chevron-right.svg";
import { RootState } from "store";
import { onSetBookingRefNo } from "@services/states/booking/booking.slice";
import { usePayment } from "@services/hooks/usePayment";
import { useSafeBottomPadding } from "shared/functions/useSafeBottomInset";
import {
  PlatformPay,
  PlatformPayButton,
  useStripe,
} from "@stripe/stripe-react-native";
import {
  formatStripePlatformPayAmount,
  getStripeClientSecret,
  getStripeErrorMessage,
  isPaymentIntentConfirmed,
  isStripeUserCancellation,
  logStripeDebugResponse,
  STRIPE_CURRENCY_CODE,
  STRIPE_MERCHANT_COUNTRY_CODE,
  STRIPE_MERCHANT_NAME,
  STRIPE_PAYMENT_TYPE_CARD,
  STRIPE_PAYMENT_TYPE_NATIVE_PAY,
  STRIPE_PLATFORM_PAY_TEST_ENV,
  STRIPE_RETURN_URL,
} from "@services/stripe/stripe.helpers";
import { useStripeInitialization } from "@services/stripe/useStripeInitialization";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;
type BookingPaymentMethod = "card" | "platformPay";

interface IBottomModalScreenProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  title?: string;
  payload: any;
  queue: string;
  defaultCard: ICustomerPaymentInfo | undefined;
  totalCost: number;
  scheduleDate: string;
  serviceType: number;
  propertyName: string;
  formatedRescheduleDate: string;
  oldBookingRefNo: string;
}

interface ICustomerPaymentInfo {
  Last4: string;
  ExpMonth: number;
  ExpYear: number;
  Fingerprint: string;
  CustomerStripeId: string;
  CustomerStripePaymentId: string;
  Brand: string;
  IsDefault: number;
}

const RescheduleModal: React.FC<IBottomModalScreenProps> = ({
  isVisible,
  setIsVisible,
  title,
  defaultCard,
  totalCost,
  scheduleDate,
  serviceType,
  propertyName,
  formatedRescheduleDate,
  oldBookingRefNo,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const buttonBottomPadding = useSafeBottomPadding(20);
  const dispatch = useDispatch();

  /**
|--------------------------------------------------
| Hooks
|--------------------------------------------------
*/
  const { customerCancelBooking, rescheduleBooking } = useBooking();
  const { createPaymentIntent } = usePayment();
  const {
    confirmPayment,
    confirmPlatformPayPayment,
    handleNextAction,
    isPlatformPaySupported,
  } = useStripe();
  /**
|--------------------------------------------------
| Redux
|--------------------------------------------------
*/
  const { token, customerId, deviceDetails } = useSelector(
    (state: RootState) => state.user,
  );
  const { ensureStripeInitialized, isStripeReady } = useStripeInitialization(
    token,
    customerId,
  );

  /**
|--------------------------------------------------
| Effects
|--------------------------------------------------
*/

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isPaymentProcessing, setIsPaymentProcessing] =
    useState<boolean>(false);
  const [isPlatformPayAvailable, setIsPlatformPayAvailable] =
    useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkPlatformPaySupport = async () => {
      if (!isVisible) {
        setIsPlatformPayAvailable(false);
        return;
      }

      try {
        const stripeReady = await ensureStripeInitialized(false);

        if (!stripeReady) {
          if (isMounted) {
            setIsPlatformPayAvailable(false);
          }
          return;
        }

        const supported = await isPlatformPaySupported(
          Platform.OS === "android"
            ? { googlePay: { testEnv: STRIPE_PLATFORM_PAY_TEST_ENV } }
            : undefined,
        );

        if (isMounted) {
          setIsPlatformPayAvailable(supported);
        }
      } catch {
        if (isMounted) {
          setIsPlatformPayAvailable(false);
        }
      }
    };

    checkPlatformPaySupport();

    return () => {
      isMounted = false;
    };
  }, [ensureStripeInitialized, isPlatformPaySupported, isVisible]);

  const handleSubmit = (paymentMethod: BookingPaymentMethod) => {
    if (paymentMethod === "card" && !defaultCard?.CustomerStripePaymentId) {
      setIsVisible(false);
      NavigationService.navigate(SCREENS.PAYMENT);
      return;
    }

    Vibration.vibrate();
    setIsFetching(true);
    cancelBooking(paymentMethod);
  };

  const resetPaymentState = () => {
    setIsFetching(false);
    setIsPaymentProcessing(false);
  };

  const getPaymentIntentPaymentType = (paymentMethod: BookingPaymentMethod) =>
    paymentMethod === "card"
      ? STRIPE_PAYMENT_TYPE_CARD
      : STRIPE_PAYMENT_TYPE_NATIVE_PAY;

  const completeConfirmedPaymentFlow = (BookingRefNo: string) => {
    dispatch(onSetBookingRefNo(BookingRefNo));
    setIsFetching(true);
    setIsVisible(false);
    setIsPaymentProcessing(false);
    NavigationService.push(SCREENS.SEARCH_SCHEDULE_SERVICE_PROVIDERS);
  };

  const confirmStripeCardPaymentIntent = async (clientSecret: string) => {
    const stripeReady = await ensureStripeInitialized();

    if (!stripeReady) {
      return false;
    }

    const result = await confirmPayment(clientSecret, {
      paymentMethodType: "Card",
    });

    if (result.error) {
      if (!isStripeUserCancellation(result.error.code)) {
        Alert.alert("Payment Error", getStripeErrorMessage(result.error));
      }
      return false;
    }

    if (isPaymentIntentConfirmed(result.paymentIntent?.status)) {
      return true;
    }

    Alert.alert(
      "Payment Error",
      "Payment was not confirmed by Stripe. Please try again.",
    );
    return false;
  };

  const handleStripePaymentNextAction = async (clientSecret: string) => {
    const stripeReady = await ensureStripeInitialized();

    if (!stripeReady) {
      return false;
    }

    const result = await handleNextAction(clientSecret, STRIPE_RETURN_URL);

    if (result.error) {
      if (!isStripeUserCancellation(result.error.code)) {
        Alert.alert("Payment Error", getStripeErrorMessage(result.error));
      }
      return false;
    }

    if (isPaymentIntentConfirmed(result.paymentIntent?.status)) {
      return true;
    }

    Alert.alert(
      "Payment Error",
      "Payment authentication was not completed. Please try again.",
    );
    return false;
  };

  const getPlatformPayConfirmParams = (): PlatformPay.ConfirmParams => {
    const platformPayAmount = formatStripePlatformPayAmount(totalCost);

    if (Platform.OS === "ios") {
      const cartItems: PlatformPay.CartSummaryItem[] = [
        {
          label: STRIPE_MERCHANT_NAME,
          amount: platformPayAmount,
          paymentType: PlatformPay.PaymentType.Immediate,
        },
      ];

      return {
        applePay: {
          merchantCountryCode: STRIPE_MERCHANT_COUNTRY_CODE,
          currencyCode: STRIPE_CURRENCY_CODE,
          merchantCapabilities: [
            PlatformPay.ApplePayMerchantCapability.Supports3DS,
          ],
          cartItems,
        },
      };
    }

    return {
      googlePay: {
        testEnv: STRIPE_PLATFORM_PAY_TEST_ENV,
        merchantName: STRIPE_MERCHANT_NAME,
        merchantCountryCode: STRIPE_MERCHANT_COUNTRY_CODE,
        currencyCode: STRIPE_CURRENCY_CODE,
        billingAddressConfig: {
          isRequired: true,
          isPhoneNumberRequired: true,
          format: PlatformPay.BillingAddressFormat.Full,
        },
      },
    };
  };

  const confirmStripePlatformPayPaymentIntent = async (
    clientSecret: string,
  ) => {
    const stripeReady = await ensureStripeInitialized();

    if (!stripeReady) {
      return false;
    }

    const platformPayParams = getPlatformPayConfirmParams();
    logStripeDebugResponse("PlatformPay confirm params", platformPayParams);

    const result = await confirmPlatformPayPayment(
      clientSecret,
      platformPayParams,
    );

    if (result.error) {
      logStripeDebugResponse("PlatformPay confirm error", result.error);
      if (!isStripeUserCancellation(result.error.code)) {
        Alert.alert("Payment Error", getStripeErrorMessage(result.error));
      }
      return false;
    }

    if (isPaymentIntentConfirmed(result.paymentIntent?.status)) {
      return true;
    }

    Alert.alert(
      "Payment Error",
      "Wallet payment was not confirmed by Stripe. Please try again.",
    );
    return false;
  };

  /**
  |--------------------------------------------------
  | Payment Creations
  |--------------------------------------------------
  */
  const onRescheduleBooking = async (paymentMethod: BookingPaymentMethod) => {
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      BookingRefNo: oldBookingRefNo,
      Scheduledate: JSON.parse(scheduleDate),
      DeviceDetails: deviceDetails,
    };

    console.log("onRescheduleBooking payload:", payload);
    setIsFetching(true);
    rescheduleBooking(
      payload,
      (data: any) => {
        console.log("response from reschdule");
        console.log(data);
        if (data?.StatusCode === "00") {
          const { BookingRefNo } = data;
          _createPaymentIntent(BookingRefNo, paymentMethod);
          // setIsFetching(false);
        } else {
          Alert.alert(data?.StatusMessage);
          setIsPaymentProcessing(false);
          setIsFetching(false);
        }
      },
      (err: any) => {
        setIsFetching(false);
        console.log("err:", err);
      },
    );
  };

  const _createPaymentIntent = (
    BookingRefNo: string,
    paymentMethod: BookingPaymentMethod,
  ) => {
    setIsPaymentProcessing(true);
    setIsFetching(true);
    const request = {
      CustomerToken: token,
      CustomerId: parseInt(customerId),
      Amount: totalCost,
      BookingRefNo,
      ServiceProviderId: 0,
      DeviceDetails: deviceDetails,
      PaymentType: getPaymentIntentPaymentType(paymentMethod),
      ...(paymentMethod === "card"
        ? {
            PaymentCustomerId: defaultCard?.CustomerStripeId || "",
            PaymentCustomerMethodId: defaultCard?.CustomerStripePaymentId || "",
          }
        : {}),
    };

    createPaymentIntent(
      request,
      async (paymentIntentResponse: any) => {
        const isPaymentAuthorized = paymentIntentResponse?.StatusCode === "00";
        const requiresStripeAction = paymentIntentResponse?.StatusCode === "02";

        if (isPaymentAuthorized || requiresStripeAction) {
          const clientSecret = getStripeClientSecret(paymentIntentResponse);
          logStripeDebugResponse(
            "CreatePaymentIntentV2 response",
            paymentIntentResponse,
            clientSecret,
          );

          if (!clientSecret) {
            Alert.alert(
              "Stripe Error",
              "PaymentIntent client secret was not returned.",
            );
            resetPaymentState();
            return;
          }

          if (isPaymentAuthorized && paymentMethod === "card") {
            completeConfirmedPaymentFlow(BookingRefNo);
            return;
          }

          const isPaymentConfirmed =
            paymentMethod === "platformPay"
              ? await confirmStripePlatformPayPaymentIntent(clientSecret)
              : requiresStripeAction
                ? await handleStripePaymentNextAction(clientSecret)
                : await confirmStripeCardPaymentIntent(clientSecret);

          if (isPaymentConfirmed) {
            completeConfirmedPaymentFlow(BookingRefNo);
          } else {
            resetPaymentState();
          }
        }
        if (paymentIntentResponse?.StatusCode === "01") {
          Alert.alert(paymentIntentResponse?.StatusMessage);
          resetPaymentState();
        }
        if (!["00", "01", "02"].includes(paymentIntentResponse?.StatusCode)) {
          Alert.alert(
            "Payment Error",
            paymentIntentResponse?.StatusMessage ||
              "Unexpected payment status.",
          );
          resetPaymentState();
        }
      },
      (error: any) => {
        Alert.alert(
          "Payment Error",
          error?.message || "Unable to start payment.",
        );
        resetPaymentState();
      },
    );
  };

  const closeSummaryModal = () => {
    setIsVisible(false);
    setIsFetching(false);
    setIsPaymentProcessing(false);
  };

  const cancelBooking = (paymentMethod: BookingPaymentMethod) => {
    setIsFetching(true);
    let BookingRefNo = oldBookingRefNo;
    const payload = {
      CustomerToken: token,
      CustomerId: customerId,
      BookingRefNo,
      DeviceDetails: deviceDetails,
    };

    // setLoading(true);
    customerCancelBooking(
      payload,
      (data: any) => {
        const { StatusCode } = data;
        if (StatusCode === "00") {
          onRescheduleBooking(paymentMethod);
        } else {
          setIsFetching(false);
          Alert.alert(
            "Something went wrong on cancelling existing booking Please try again",
          );
          setIsVisible(false);
        }
      },
      (err: any) => {
        console.log("err:", err);
        setIsFetching(false);
      },
    );
  };

  /**
|--------------------------------------------------
| Render Components
|--------------------------------------------------
*/
  const CardContent = () => {
    if (!defaultCard?.CustomerStripePaymentId) {
      return (
        <View style={{ marginVertical: 20 }}>
          <Text style={{ fontSize: 12 }} color={v2Colors.orange}>
            Note: The final price will vary slightly based on your payment
            method and will be shown after setup.
          </Text>
        </View>
      );
    }

    return (
      <Pressable
        style={styles.cardContainer}
        onPress={() => {
          setIsVisible(() => false);
          setTimeout(() => NavigationService.navigate(SCREENS.PAYMENT), 300);
        }}
      >
        <View style={styles.cardLeftContent}>
          <VISA pointerEvents="none" height={40} width={40} />
          <View style={styles.cardMiddleContent}>
            <Text bold color={v2Colors.green}>
              {`${defaultCard?.Brand}`}
            </Text>
            <Text
              color={v2Colors.green}
            >{`XXXX XXXX XXXX ${defaultCard?.Last4}`}</Text>
          </View>
        </View>
        <CHEVRON_RIGHT pointerEvents="none" />
      </Pressable>
    );
  };

  const Content = () => (
    <View style={styles.content}>
      <Pressable style={styles.closeButton} onPress={closeSummaryModal}>
        <Icon
          name="close"
          type={IconType.MaterialIcons}
          color={v2Colors.lightRed}
          size={25}
        />
      </Pressable>
      {isFetching ? <Header2 /> : <Header />}

      <View style={styles.body}>
        <Item
          icon={<Calendar pointerEvents="none" height={24} width={24} />}
          text={formatedRescheduleDate}
        />
        <Item
          icon={<HouseProperty pointerEvents="none" height={24} width={24} />}
          text={propertyName}
        />
        <Item
          icon={<MowerGreen pointerEvents="none" height={24} width={24} />}
          text={
            serviceType === 1
              ? "Trim - Edge - Mow - Blow"
              : serviceType === 2
                ? "Trim - Edge - Mulch - Blow"
                : "Trim - Edge - Mow - Blow"
          }
        />
        <View style={styles.serviceContainer}>
          <Text h4 color={v2Colors.green}>
            Total Cost
          </Text>
          <Text h4 bold color={v2Colors.green}>
            {totalCost + " AUD" || ""}
          </Text>
        </View>

        <CardContent />
      </View>
      <Confirm />
    </View>
  );

  const Item = (props: { icon: JSX.Element; text: string }) => {
    return (
      <View style={styles.item}>
        {props.icon}
        <View style={{ width: 20 }} />
        <Text h5 color={v2Colors.green}>
          {props.text}
        </Text>
      </View>
    );
  };

  const Header = () => (
    <View style={styles.header}>
      <Text h3 bold color={v2Colors.green}>
        {title}
      </Text>
    </View>
  );

  const Header2 = () => (
    <View style={styles.header}>
      <View style={{ marginBottom: 10 }}>
        <Text h3 bold color={v2Colors.green}>
          Validating payment method
        </Text>
      </View>
      <Progress.Bar
        animated={true}
        borderColor={v2Colors.green}
        color={v2Colors.orange}
        animationType="timing"
        progress={1}
        indeterminate={true}
        borderWidth={0}
        width={200}
        indeterminateAnimationDuration={1000}
      />
    </View>
  );

  const Confirm = () => (
    <View style={[styles.buttonContainer, buttonBottomPadding]}>
      {defaultCard?.CustomerStripePaymentId ? (
        <CommonButton
          text={"Confirm"}
          onPress={() => handleSubmit("card")}
          style={{ borderRadius: 5 }}
          isFetching={isFetching}
          disabled={isFetching}
        />
      ) : null}
      {isStripeReady && isPlatformPayAvailable ? (
        <PlatformPayButton
          type={PlatformPay.ButtonType.Book}
          appearance={PlatformPay.ButtonStyle.Black}
          borderRadius={5}
          onPress={() => handleSubmit("platformPay")}
          disabled={isFetching || isPaymentProcessing}
          style={styles.platformPayButton}
        />
      ) : null}
      {!defaultCard?.CustomerStripePaymentId ? (
        <CommonButton
          text={"Add Payment Method"}
          onPress={() => {
            setIsVisible(false);
            NavigationService.navigate(SCREENS.PAYMENT);
          }}
          style={{ borderRadius: 5 }}
          isFetching={isFetching}
          disabled={isFetching}
        />
      ) : null}
    </View>
  );

  return (
    <GestureRecognizer onSwipeDown={() => setIsVisible(false)}>
      <Modal
        isVisible={isVisible}
        swipeDirection="down"
        style={styles.modal}
        animationOut="slideOutDown"
        animationInTiming={100}
        animationOutTiming={100}
        useNativeDriver={false}
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}
      >
        <Content />
      </Modal>
    </GestureRecognizer>
  );
};

export default RescheduleModal;
