import React, { useMemo, useRef, useState } from "react";
import {
  View,
  StyleProp,
  ViewStyle,
  Pressable,
  Alert,
  Vibration,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Modal from "react-native-modal";
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
import { useStripe } from "@stripe/stripe-react-native";
import {
  getStripeClientSecret,
  getStripeErrorMessage,
  isPaymentIntentConfirmed,
  isStripeUserCancellation,
  STRIPE_PAYMENT_TYPE_CARD,
  STRIPE_RETURN_URL,
} from "@services/stripe/stripe.helpers";
import { useStripeInitialization } from "@services/stripe/useStripeInitialization";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;
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
  const presentingRef = useRef<boolean>(false); // ✅ prevents double present

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

  const { lawnURIList, property, rawDate, selectedServiceTypeId } =
    useSelector((state: RootState) => state.booking);
  const { ensureStripeInitialized } = useStripeInitialization(
    token,
    customerId,
  );

  const { createPaymentIntent } = usePayment();
  const { confirmPayment, handleNextAction, retrievePaymentIntent } =
    useStripe();
  /**
|--------------------------------------------------
| Effects
|--------------------------------------------------
*/

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isPaymentProcessing, setIsPaymentProcessing] =
    useState<boolean>(false);
  // A saved payment method (card, or a card added via Apple/Google Pay setup)
  // is the only thing that gates checkout. Raw device wallet capability isn't
  // trustworthy at charge time: Stripe's iOS SDK caches its "does Apple Pay
  // have a card" answer once per app process, so it can keep reporting a
  // wallet as usable long after the user removed their only card.
  const hasSavedCard = Boolean(defaultCard?.CustomerStripePaymentId);
  const isSelectedPaymentMethodReady = hasSavedCard;

  const handleSubmit = () => {
    if (!hasSavedCard) {
      addWalletAndRedirect();
      return;
    }

    if (presentingRef.current) return; // hard guard against double-tap
    presentingRef.current = true;

    Vibration.vibrate();
    // _validatePayment();
    setIsFetching(true);
    if (queue === "later") {
      onSaveScheduledBooking();
    } else {
      onSaveBookingToday();
    }
  };

  const resetPaymentState = () => {
    presentingRef.current = false;
    setIsFetching(false);
    setIsPaymentProcessing(false);
  };

  const getStripePaymentIntentErrorMessage = async (
    clientSecret: string,
    stripeResultOrError: any,
  ) => {
    try {
      const retrievedResult = await retrievePaymentIntent(clientSecret);

      return getStripeErrorMessage({
        ...stripeResultOrError,
        paymentIntent: retrievedResult.paymentIntent,
        retrievePaymentIntentError: retrievedResult.error,
      });
    } catch {
      return getStripeErrorMessage(stripeResultOrError);
    }
  };

  const completeConfirmedPaymentFlow = (Action: string) => {
    presentingRef.current = false;
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
          Alert.alert(
            PAYMENT_ERROR_TITLE,
            await getStripePaymentIntentErrorMessage(clientSecret, result),
          );
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
        Alert.alert(
          PAYMENT_ERROR_TITLE,
          await getStripePaymentIntentErrorMessage(clientSecret, error),
        );
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
          Alert.alert(
            PAYMENT_ERROR_TITLE,
            await getStripePaymentIntentErrorMessage(clientSecret, result),
          );
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
        Alert.alert(
          PAYMENT_ERROR_TITLE,
          await getStripePaymentIntentErrorMessage(clientSecret, error),
        );
      }
      return false;
    }
  };

  /**
  |--------------------------------------------------
  | Payment Creations
  |--------------------------------------------------
  */

  const _createPaymentIntent = (BookingRefNo: string, Action: string) => {
    setIsPaymentProcessing(true);
    const request = {
      CustomerToken: token,
      CustomerId: parseInt(customerId),
      Amount: data.fee,
      BookingRefNo,
      ServiceProviderId: 0,
      DeviceDetails: deviceDetails,
      PaymentType: STRIPE_PAYMENT_TYPE_CARD,
      PaymentCustomerId: defaultCard?.CustomerStripeId || "",
      PaymentCustomerMethodId: defaultCard?.CustomerStripePaymentId || "",
    };

    createPaymentIntent(
      request,
      async (paymentIntentResponse: any) => {
        // Wrapped so ANY unexpected exception here still releases the button -
        // the user must never be left stuck on a failed/edge-case response.
        try {
          const statusCode = paymentIntentResponse?.StatusCode;
          const requiresStripeAction = statusCode === "02";

          if (statusCode !== "00" && !requiresStripeAction) {
            Alert.alert(
              PAYMENT_ERROR_TITLE,
              getStripeErrorMessage(paymentIntentResponse, PAYMENT_ERROR_MESSAGE),
            );
            resetPaymentState();
            return;
          }

          const clientSecret = getStripeClientSecret(paymentIntentResponse);

          if (!clientSecret) {
            Alert.alert(PAYMENT_ERROR_TITLE, PAYMENT_START_ERROR_MESSAGE);
            resetPaymentState();
            return;
          }

          if (statusCode === "00") {
            completeConfirmedPaymentFlow(Action);
            return;
          }

          const isPaymentConfirmed = requiresStripeAction
            ? await handleStripePaymentNextAction(clientSecret)
            : await confirmStripeCardPaymentIntent(clientSecret);

          if (isPaymentConfirmed) {
            completeConfirmedPaymentFlow(Action);
          } else {
            resetPaymentState();
          }
        } catch (error: any) {
          Alert.alert(
            PAYMENT_ERROR_TITLE,
            getStripeErrorMessage(error, PAYMENT_ERROR_MESSAGE),
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

  const onSaveScheduledBooking = async () => {
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
    request.append("PaymentMethodType", "Card");
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
        if (data.StatusCode === "00") {
          dispatch(onSetBookingRefNo(data.BookingRefNo));
          _createPaymentIntent(data.BookingRefNo, "BookLater");
          return;
        }

        // Any non-success status (including unexpected ones) must still
        // release the button - the user can never be left stuck on a failure.
        Alert.alert(
          "Booking Error",
          data?.StatusMessage || "Unable to save booking. Please try again.",
        );
        resetPaymentState();
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

  const onSaveBookingToday = () => {
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
    request.append("PaymentMethodType", "Card");
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
        if (data.StatusCode === "00") {
          dispatch(onSetBookingRefNo(data.BookingRefNo));
          _createPaymentIntent(data.BookingRefNo, "BookingToday");
          return;
        }

        // Any non-success status (including unexpected ones) must still
        // release the button - the user can never be left stuck on a failure.
        Alert.alert(
          "Booking Error",
          data?.StatusMessage || "Unable to save booking. Please try again.",
        );
        resetPaymentState();
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

  const getPaymentMethodDisplay = () => {
    if (hasSavedCard) {
      return {
        title: defaultCard?.Brand || "Card",
        subtitle: `XXXX XXXX XXXX ${defaultCard?.Last4}`,
      };
    }

    return {
      title: "Add payment method",
      subtitle: "Card required to secure booking",
    };
  };

  const PaymentMethodSelector = () => {
    const selectedMethod = getPaymentMethodDisplay();

    return (
      <Pressable
        style={styles.cardContainer}
        hitSlop={8}
        onPress={() => {
          if (isFetching || isPaymentProcessing) {
            return;
          }

          NavigationService.push(SCREENS.PAYMENT, { returnOnSelect: true });
        }}
      >
        <View style={styles.cardLeftContent}>
          <VISA pointerEvents="none" height={40} width={40} />
          <View style={styles.cardMiddleContent}>
            <Text bold color={v2Colors.green} numberOfLines={1}>
              {selectedMethod.title}
            </Text>
            <Text color={v2Colors.green} numberOfLines={1}>
              {selectedMethod.subtitle}
            </Text>
          </View>
        </View>
        <CHEVRON_RIGHT pointerEvents="none" />
      </Pressable>
    );
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
      {isFetching ? Header2() : Header()}

      <View style={styles.body}>
        {Item({
          icon: <Calendar pointerEvents="none" height={24} width={24} />,
          text: data?.date,
        })}
        {Item({
          icon: <HouseProperty pointerEvents="none" height={24} width={24} />,
          text: data?.name,
        })}
        {Item({
          icon: <MowerGreen pointerEvents="none" height={24} width={24} />,
          text:
            data.serviceName === 1
              ? "Trim - Edge - Mow - Blow"
              : data.serviceName === 2
                ? "Trim - Edge - Mulch - Blow"
                : "Trim - Edge - Mow - Blow",
        })}
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
        {PaymentMethodSelector()}
        {!isSelectedPaymentMethodReady && (
          <Text style={{ fontSize: 12, marginTop: 4 }} color={v2Colors.orange}>
            Note: The final price will vary slightly based on your payment
            method and will be shown after setup.
          </Text>
        )}
      </View>
      {ConditionalConfirm()}
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

  const ConditionalConfirm = () => {
    const isBusy = isFetching || isPaymentProcessing;

    return (
      <View style={[styles.buttonContainer, buttonBottomPadding]}>
        <CommonButton
          text={
            isSelectedPaymentMethodReady
              ? "Secure Booking"
              : "Add Payment Method"
          }
          onPress={() => {
            if (isSelectedPaymentMethodReady) {
              handleSubmit();
              return;
            }

            addWalletAndRedirect();
          }}
          style={{ borderRadius: 5 }}
          isFetching={isBusy}
          disabled={isBusy}
        />
      </View>
    );
  };

  const addWalletAndRedirect = () => {
    NavigationService.push(SCREENS.PAYMENT, { returnOnSelect: true });
  };

  const handleSwipeDown = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection="down"
      onSwipeComplete={handleSwipeDown}
      style={styles.modal}
      animationOut="slideOutDown"
      animationInTiming={500}
      animationOutTiming={500}
      useNativeDriver={false}
      hideModalContentWhileAnimating
      backdropTransitionOutTiming={0}
    >
      {Content()}
    </Modal>
  );
};

export default BottomModal;
