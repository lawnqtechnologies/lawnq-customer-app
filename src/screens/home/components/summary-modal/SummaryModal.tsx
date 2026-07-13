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
import createStyles from "./SummaryModal.style";
import Text from "@shared-components/text-wrapper/TextWrapper";
import CommonButton from "@shared-components/buttons/CommonButton";
import { SCREENS } from "@shared-constants";
import { v2Colors } from "@theme/themes";

import { useBooking } from "@services/hooks/useBooking";

/**
 * ? SVGs
 */
import LikeGreenCircle from "@assets/v2/homescreen/icons/like-green-circle.svg";
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
const PAYMENT_ERROR_TITLE = "Payment Issue";
const PAYMENT_ERROR_MESSAGE =
  "We couldn't complete your payment. Please try again or use another payment method.";
const PAYMENT_START_ERROR_MESSAGE =
  "We couldn't start your payment securely. Please try again.";

interface IBottomModalScreenProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  title?: string;
  data: {
    date: string;
    serviceName: number;
    name: string;
    fee: string;
    discountName: string;
    totalDiscount: string;
    customerDiscountId: number;
    collectClippings: number;
  };
  payload: any;
  queue: string;
  defaultCard: ICustomerPaymentInfo | undefined;
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

const BottomModal: React.FC<IBottomModalScreenProps> = ({
  isVisible,
  setIsVisible,
  title,
  data,
  payload,
  queue,
  defaultCard,
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
  const { saveScheduledBooking } = useBooking();

  /**
|--------------------------------------------------
| Redux
|--------------------------------------------------
*/
  const { token, customerId, deviceDetails } = useSelector(
    (state: RootState) => state.user,
  );

  const { lawnURIList, property, rawDate, selectedServiceTypeId } = useSelector(
    (state: RootState) => state.booking,
  );
  const { ensureStripeInitialized, isStripeReady } = useStripeInitialization(
    token,
    customerId,
  );

  const { createPaymentIntent } = usePayment();
  const {
    confirmPayment,
    confirmPlatformPayPayment,
    handleNextAction,
    isPlatformPaySupported,
  } = useStripe();
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
      addWalletAndRedirect();
      return;
    }

    Vibration.vibrate();
    // _validatePayment();
    setIsFetching(true);
    if (queue === "later") {
      onSaveScheduledBooking(paymentMethod);
    } else {
      onSaveBookingToday(paymentMethod);
    }
  };

  const getPlatformPayPaymentMethodType = () =>
    Platform.OS === "ios" ? "ApplePay" : "GooglePay";

  const getBackendPaymentMethodType = (paymentMethod: BookingPaymentMethod) =>
    paymentMethod === "card" ? "Card" : getPlatformPayPaymentMethodType();

  const getPaymentIntentPaymentType = (paymentMethod: BookingPaymentMethod) =>
    paymentMethod === "card"
      ? STRIPE_PAYMENT_TYPE_CARD
      : STRIPE_PAYMENT_TYPE_NATIVE_PAY;

  const resetPaymentState = () => {
    setIsFetching(false);
    setIsPaymentProcessing(false);
  };

  const completeConfirmedPaymentFlow = (Action: string) => {
    setIsFetching(false);
    setIsVisible(false);
    setIsPaymentProcessing(false);

    if (Action === "BookingToday") {
      NavigationService.push(SCREENS.SEARCH_SERVICE_PROVIDERS);
    }

    if (Action === "BookLater") {
      NavigationService.push(SCREENS.SEARCH_SCHEDULE_SERVICE_PROVIDERS);
    }
  };

  const confirmStripeCardPaymentIntent = async (clientSecret: string) => {
    const stripeReady = await ensureStripeInitialized();

    if (!stripeReady) {
      return false;
    }

    try {
      const result = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (result.error) {
        if (!isStripeUserCancellation(result.error.code)) {
          Alert.alert(PAYMENT_ERROR_TITLE, getStripeErrorMessage(result.error));
        }
        return false;
      }

      if (isPaymentIntentConfirmed(result.paymentIntent?.status)) {
        return true;
      }

      Alert.alert(
        PAYMENT_ERROR_TITLE,
        "Payment was not completed. Please try again.",
      );
      return false;
    } catch (error: any) {
      if (!isStripeUserCancellation(error?.code || error?.message)) {
        Alert.alert(PAYMENT_ERROR_TITLE, getStripeErrorMessage(error));
      }
      return false;
    }
  };

  const handleStripePaymentNextAction = async (clientSecret: string) => {
    const stripeReady = await ensureStripeInitialized();

    if (!stripeReady) {
      return false;
    }

    try {
      const result = await handleNextAction(clientSecret, STRIPE_RETURN_URL);

      if (result.error) {
        if (!isStripeUserCancellation(result.error.code)) {
          Alert.alert(PAYMENT_ERROR_TITLE, getStripeErrorMessage(result.error));
        }
        return false;
      }

      if (isPaymentIntentConfirmed(result.paymentIntent?.status)) {
        return true;
      }

      Alert.alert(
        PAYMENT_ERROR_TITLE,
        "Payment authentication was not completed. Please try again.",
      );
      return false;
    } catch (error: any) {
      if (!isStripeUserCancellation(error?.code || error?.message)) {
        Alert.alert(PAYMENT_ERROR_TITLE, getStripeErrorMessage(error));
      }
      return false;
    }
  };

  const getPlatformPayConfirmParams = (): PlatformPay.ConfirmParams => {
    const platformPayAmount = formatStripePlatformPayAmount(data.fee);

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

    try {
      const result = await confirmPlatformPayPayment(
        clientSecret,
        getPlatformPayConfirmParams(),
      );

      if (result.error) {
        if (!isStripeUserCancellation(result.error.code)) {
          Alert.alert(PAYMENT_ERROR_TITLE, getStripeErrorMessage(result.error));
        }
        return false;
      }

      if (isPaymentIntentConfirmed(result.paymentIntent?.status)) {
        return true;
      }

      Alert.alert(
        PAYMENT_ERROR_TITLE,
        "Wallet payment was not completed. Please try again.",
      );
      return false;
    } catch (error: any) {
      if (!isStripeUserCancellation(error?.code || error?.message)) {
        Alert.alert(PAYMENT_ERROR_TITLE, getStripeErrorMessage(error));
      }
      return false;
    }
  };

  /**
  |--------------------------------------------------
  | Payment Creations
  |--------------------------------------------------
  */

  const _createPaymentIntent = (
    BookingRefNo: string,
    Action: string,
    paymentMethod: BookingPaymentMethod,
  ) => {
    setIsPaymentProcessing(true);
    const request = {
      CustomerToken: token,
      CustomerId: parseInt(customerId),
      Amount: data.fee,
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

          if (!clientSecret) {
            Alert.alert(PAYMENT_ERROR_TITLE, PAYMENT_START_ERROR_MESSAGE);
            resetPaymentState();
            return;
          }

          if (isPaymentAuthorized && paymentMethod === "card") {
            completeConfirmedPaymentFlow(Action);
            return;
          }

          const isPaymentConfirmed =
            paymentMethod === "platformPay"
              ? await confirmStripePlatformPayPaymentIntent(clientSecret)
              : requiresStripeAction
                ? await handleStripePaymentNextAction(clientSecret)
                : await confirmStripeCardPaymentIntent(clientSecret);

          if (isPaymentConfirmed) {
            completeConfirmedPaymentFlow(Action);
          } else {
            resetPaymentState();
          }
        }
        if (paymentIntentResponse?.StatusCode === "01") {
          Alert.alert(
            PAYMENT_ERROR_TITLE,
            getStripeErrorMessage(paymentIntentResponse, PAYMENT_ERROR_MESSAGE),
          );
          resetPaymentState();
        }
        if (!["00", "01", "02"].includes(paymentIntentResponse?.StatusCode)) {
          Alert.alert(
            PAYMENT_ERROR_TITLE,
            getStripeErrorMessage(paymentIntentResponse, PAYMENT_ERROR_MESSAGE),
          );
          resetPaymentState();
        }
      },
      (error: any) => {
        Alert.alert(
          PAYMENT_ERROR_TITLE,
          getStripeErrorMessage(error, PAYMENT_START_ERROR_MESSAGE),
        );
        resetPaymentState();
      },
    );
  };

  /**
  |--------------------------------------------------
  | Booking Creations
  |--------------------------------------------------
  */

  const onSaveScheduledBooking = async (
    paymentMethod: BookingPaymentMethod,
  ) => {
    const lawnImageRequest = async () => {
      if (lawnURIList[0]) return request.append("LawnImages", lawnURIList[0]);

      return request.append("LawnImages", []);
    };

    const payloadObject = Object.fromEntries(payload?._parts || []);
    const {
      Cost,
      TotalCost,
      GSTFee,
      StripeCommissionFee,
      GrassLengthId,
      MowLengthId,
    } = payloadObject;

    let request = new FormData();
    request.append("CustomerToken", token);
    request.append("CustomerId", customerId);
    await lawnImageRequest();
    request.append("AddressId", property.value);
    request.append("ServiceProviderId", 0);

    request.append("Cost", Cost);
    request.append("TotalCost", TotalCost);
    request.append("GSTFee", GSTFee);
    request.append("StripeCommissionFee", StripeCommissionFee);

    request.append("BookingServiceStepId", selectedServiceTypeId);
    request.append("BookingTypeId", 2);
    request.append("Remarks", "Empty");
    request.append("GrassLengthId", GrassLengthId || "1");
    request.append("MowLengthId", MowLengthId);
    request.append("BookingServiceTypeId", selectedServiceTypeId || 0);
    request.append(
      "CustomerStripePaymentId",
      defaultCard?.CustomerStripePaymentId || "",
    );
    request.append(
      "PaymentMethodType",
      getBackendPaymentMethodType(paymentMethod),
    );
    if (paymentMethod === "platformPay") {
      request.append("WalletType", getPlatformPayPaymentMethodType());
    }
    request.append("CustomerDiscountId", data.customerDiscountId ?? 0);
    request.append("CollectClippings", data.collectClippings ?? 0);
    request.append("PropertyAddId", property.value);
    request.append("Scheduledate", JSON.parse(rawDate));
    request.append("DeviceDetails.AppVersion", deviceDetails.AppVersion);
    request.append("DeviceDetails.DeviceModel", deviceDetails.DeviceModel);
    request.append("DeviceDetails.DeviceVersion", deviceDetails.DeviceVersion);
    request.append("DeviceDetails.IpAddress", deviceDetails.IpAddress);
    request.append("DeviceDetails.MacAddress", deviceDetails.MacAddress);
    request.append("DeviceDetails.Platform", deviceDetails.Platform);
    request.append("DeviceDetails.PlatformOs", deviceDetails.PlatformOs);

    saveScheduledBooking(
      request,
      (data: any) => {
        if (data.StatusCode === "01") {
          Alert.alert(data.StatusMessage);
          return;
        }
        if (data.StatusCode === "00") {
          dispatch(onSetBookingRefNo(data.BookingRefNo));
          _createPaymentIntent(data.BookingRefNo, "BookLater", paymentMethod);
        }
      },
      (err: any) => {
        Alert.alert(
          "Booking Error",
          err?.response?.data?.StatusMessage ||
            err?.response?.data?.message ||
            err?.response?.data?.Message ||
            err?.message ||
            "Unable to save booking.",
        );
        resetPaymentState();
      },
    );
  };

  const onSaveBookingToday = (paymentMethod: BookingPaymentMethod) => {
    const payloadObject = Object.fromEntries(payload?._parts || []);
    const {
      Cost,
      TotalCost,
      GSTFee,
      StripeCommissionFee,
      GrassLengthId,
      MowLengthId,
    } = payloadObject;

    let request = new FormData();
    request.append("CustomerToken", token);
    request.append("CustomerId", customerId);
    if (lawnURIList[0]) request.append("LawnImages", lawnURIList[0]);
    request.append("AddressId", property.value);
    request.append("ServiceProviderId", 0);

    request.append("Cost", Cost);
    request.append("TotalCost", TotalCost);
    request.append("GSTFee", GSTFee);
    request.append("StripeCommissionFee", StripeCommissionFee);

    request.append("BookingServiceStepId", selectedServiceTypeId);
    request.append("BookingTypeId", 1);
    request.append("Remarks", "Empty");
    request.append("GrassLengthId", GrassLengthId || "1");
    request.append("MowLengthId", MowLengthId);
    request.append("BookingServiceTypeId", selectedServiceTypeId || 0);
    request.append(
      "CustomerStripePaymentId",
      defaultCard?.CustomerStripePaymentId || "",
    );
    request.append(
      "PaymentMethodType",
      getBackendPaymentMethodType(paymentMethod),
    );
    if (paymentMethod === "platformPay") {
      request.append("WalletType", getPlatformPayPaymentMethodType());
    }
    request.append("CustomerDiscountId", data.customerDiscountId ?? 0);
    request.append("CollectClippings", data.collectClippings ?? 0);
    request.append("PropertyAddId", property.value);
    request.append("Scheduledate", new Date().toISOString());
    request.append("DeviceDetails.AppVersion", deviceDetails.AppVersion);
    request.append("DeviceDetails.DeviceModel", deviceDetails.DeviceModel);
    request.append("DeviceDetails.DeviceVersion", deviceDetails.DeviceVersion);
    request.append("DeviceDetails.IpAddress", deviceDetails.IpAddress);
    request.append("DeviceDetails.MacAddress", deviceDetails.MacAddress);
    request.append("DeviceDetails.Platform", deviceDetails.Platform);
    request.append("DeviceDetails.PlatformOs", deviceDetails.PlatformOs);

    saveScheduledBooking(
      request,
      (data: any) => {
        if (data.StatusCode === "01") {
          Alert.alert(data.StatusMessage);
          return;
        }
        if (data.StatusCode === "00") {
          dispatch(onSetBookingRefNo(data.BookingRefNo));
          _createPaymentIntent(
            data.BookingRefNo,
            "BookingToday",
            paymentMethod,
          );
        }
      },
      (err: any) => {
        Alert.alert(
          "Booking Error",
          err?.response?.data?.StatusMessage ||
            err?.response?.data?.message ||
            err?.response?.data?.Message ||
            err?.message ||
            "Unable to save booking.",
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

  const CardContent = () => {
    if (defaultCard?.CustomerStripePaymentId !== undefined) {
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
    } else {
      return (
        <View style={{ marginVertical: 20 }}>
          <Text style={{ fontSize: 12 }} color={v2Colors.orange}>
            Note: The final price will vary slightly based on your payment
            method and will be shown after setup.
          </Text>
        </View>
      );
    }
  };

  /**
|--------------------------------------------------
| Render Components
|--------------------------------------------------
*/
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
      <LikeGreenCircle
        pointerEvents="none"
        height={75}
        width={75}
        style={styles.icon}
      />
      {isFetching ? <Header2 /> : <Header />}

      <View style={styles.body}>
        <Item
          icon={<Calendar pointerEvents="none" height={24} width={24} />}
          text={data?.date}
        />
        <Item
          icon={<HouseProperty pointerEvents="none" height={24} width={24} />}
          text={data?.name}
        />
        <Item
          icon={<MowerGreen pointerEvents="none" height={24} width={24} />}
          text={
            data.serviceName === 1
              ? "Trim - Edge - Mow - Blow"
              : data.serviceName === 2
                ? "Trim - Edge - Mulch - Blow"
                : "Trim - Edge - Mow - Blow"
          }
        />
        {data.customerDiscountId !== 0 && (
          <>
            <View style={styles.discountTitle}>
              <Text
                style={{ fontSize: 12, margin: 2, fontWeight: "bold" }}
                color={"white"}
              >
                {data.discountName}
              </Text>
            </View>
            <View style={styles.discountDetail}>
              <Text h4 color={v2Colors.green}>
                You Saved
              </Text>
              <Text h4 bold color={v2Colors.green}>
                {"$" + data.totalDiscount || ""}
              </Text>
            </View>
          </>
        )}

        <View style={styles.serviceContainer}>
          <Text h4 color={v2Colors.green}>
            Total Cost
          </Text>
          <Text h4 bold color={v2Colors.green}>
            {"$" + data.fee || ""}
          </Text>
        </View>

        <View style={styles.serviceContainer}>
          <Text h4 color={v2Colors.green}></Text>
          <Text style={{ fontSize: 12 }} color={v2Colors.green}>
            (Includes 10% GST)
          </Text>
        </View>
        <CardContent />
      </View>
      <ConditionalConfirm />
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
          Processing Booking
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

  const PlatformPayAction = () => {
    if (!isStripeReady || !isPlatformPayAvailable) {
      return null;
    }

    return (
      <PlatformPayButton
        type={PlatformPay.ButtonType.Book}
        appearance={PlatformPay.ButtonStyle.Black}
        borderRadius={5}
        onPress={() => handleSubmit("platformPay")}
        disabled={isFetching || isPaymentProcessing}
        style={styles.platformPayButton}
      />
    );
  };

  const ConditionalConfirm = () => {
    if (defaultCard?.CustomerStripePaymentId !== undefined) {
      return (
        <View style={[styles.buttonContainer, buttonBottomPadding]}>
          <CommonButton
            text={"Secure Booking"}
            onPress={() => handleSubmit("card")}
            style={{ borderRadius: 5 }}
            isFetching={isFetching}
            disabled={isFetching}
          />
          <PlatformPayAction />
        </View>
      );
    } else {
      return (
        <View style={[styles.buttonContainer, buttonBottomPadding]}>
          <PlatformPayAction />
          <CommonButton
            text={"Add Payment Method"}
            onPress={addWalletAndRedirect}
            style={{ borderRadius: 5 }}
            isFetching={isFetching}
            disabled={isFetching}
          />
        </View>
      );
    }
  };

  const addWalletAndRedirect = () => {
    setIsVisible(false);
    NavigationService.navigate(SCREENS.PAYMENT);
  };

  // NavigationService.navigate(SCREENS.PAYMENT);

  return (
    <GestureRecognizer onSwipeDown={() => setIsVisible(false)}>
      <Modal
        isVisible={isVisible}
        swipeDirection="down"
        style={styles.modal}
        animationOut="slideOutDown"
        animationInTiming={500}
        animationOutTiming={500}
        useNativeDriver={false}
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}
      >
        <Content />
      </Modal>
    </GestureRecognizer>
  );
};

export default BottomModal;
