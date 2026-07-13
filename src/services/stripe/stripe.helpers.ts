import { LQ_API } from "@env";

export const STRIPE_URL_SCHEME = "app.lawnq";
export const STRIPE_RETURN_URL = `${STRIPE_URL_SCHEME}://safepay`;
export const STRIPE_MERCHANT_IDENTIFIER = "merchant.com.app.lawnq";
export const STRIPE_MERCHANT_NAME = "LawnQ";
export const STRIPE_MERCHANT_COUNTRY_CODE = "AU";
export const STRIPE_CURRENCY_CODE = "AUD";
export const STRIPE_PAYMENT_TYPE_CARD = "card";
export const STRIPE_PAYMENT_TYPE_NATIVE_PAY = "native_pay";

// Keeps wallet-pay test mode and live-key blocking aligned with non-production API builds.
const isTestApiBaseUrl = (apiBaseUrl?: string | null) => {
  const normalizedBaseUrl = apiBaseUrl?.toLowerCase() || "";

  return (
    normalizedBaseUrl.includes("test") ||
    normalizedBaseUrl.includes("staging") ||
    normalizedBaseUrl.includes("dev") ||
    normalizedBaseUrl.includes("localhost") ||
    normalizedBaseUrl.includes("127.0.0.1") ||
    normalizedBaseUrl.includes("10.0.2.2")
  );
};

export const STRIPE_PLATFORM_PAY_TEST_ENV = __DEV__ || isTestApiBaseUrl(LQ_API);

export const isStripeTestPublishableKey = (publishableKey?: string | null) =>
  Boolean(publishableKey?.startsWith("pk_test_"));

export const isStripeLivePublishableKey = (publishableKey?: string | null) =>
  Boolean(publishableKey?.startsWith("pk_live_"));

export const getSafeStripePublishableKeyForCurrentBuild = (
  publishableKey?: string | null,
): string | undefined => {
  if (!publishableKey) {
    return undefined;
  }

  if (
    STRIPE_PLATFORM_PAY_TEST_ENV &&
    isStripeLivePublishableKey(publishableKey)
  ) {
    return undefined;
  }

  return publishableKey;
};

export const assertStripePublishableKeySafeForCurrentBuild = (
  publishableKey?: string | null,
): string => {
  const safePublishableKey =
    getSafeStripePublishableKeyForCurrentBuild(publishableKey);

  if (safePublishableKey) {
    return safePublishableKey;
  }

  if (STRIPE_PLATFORM_PAY_TEST_ENV && isStripeLivePublishableKey(publishableKey)) {
    throw new Error("Live Stripe keys cannot be used in this test build.");
  }

  throw new Error("Stripe publishable key is missing.");
};

const normalizeKey = (key: string) => key.replace(/_/g, "").toLowerCase();

const STRIPE_CLIENT_SECRET_PATTERN =
  /\b(?:pi|seti)_[A-Za-z0-9]+_secret_[A-Za-z0-9]+(?:_[A-Za-z0-9]+)?\b/;

const parseJsonString = (value: string): unknown | undefined => {
  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith("{") && !trimmedValue.startsWith("[")) {
    return undefined;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return undefined;
  }
};

const findClientSecret = (
  value: unknown,
  visited = new Set<object>(),
): string | undefined => {
  if (typeof value === "string") {
    const directMatch = value.match(STRIPE_CLIENT_SECRET_PATTERN)?.[0];

    if (directMatch) {
      return directMatch;
    }

    const parsedValue = parseJsonString(value);

    if (parsedValue) {
      return findClientSecret(parsedValue, visited);
    }
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  if (visited.has(value)) {
    return undefined;
  }

  visited.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const clientSecret = findClientSecret(item, visited);
      if (clientSecret) {
        return clientSecret;
      }
    }
    return undefined;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedKey = normalizeKey(key);

    if (
      (normalizedKey === "clientsecret" ||
        normalizedKey.endsWith("clientsecret")) &&
      typeof nestedValue === "string" &&
      nestedValue.length > 0
    ) {
      return nestedValue;
    }
  }

  for (const nestedValue of Object.values(value)) {
    const clientSecret = findClientSecret(nestedValue, visited);
    if (clientSecret) {
      return clientSecret;
    }
  }

  return undefined;
};

const findPublishableKey = (
  value: unknown,
  visited = new Set<object>(),
): string | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  if (visited.has(value)) {
    return undefined;
  }

  visited.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const publishableKey = findPublishableKey(item, visited);
      if (publishableKey) {
        return publishableKey;
      }
    }
    return undefined;
  }

  const paymentKeyResponse = value as Record<string, unknown>;
  const keyName =
    paymentKeyResponse.StripeKeyName || paymentKeyResponse.stripeKeyName;
  const stripeKey =
    paymentKeyResponse.StripeKey || paymentKeyResponse.stripeKey;

  if (keyName === "PublishableKey" && typeof stripeKey === "string") {
    return stripeKey;
  }

  for (const [key, nestedValue] of Object.entries(paymentKeyResponse)) {
    if (
      normalizeKey(key) === "publishablekey" &&
      typeof nestedValue === "string" &&
      nestedValue.length > 0
    ) {
      return nestedValue;
    }
  }

  for (const nestedValue of Object.values(paymentKeyResponse)) {
    const publishableKey = findPublishableKey(nestedValue, visited);
    if (publishableKey) {
      return publishableKey;
    }
  }

  return undefined;
};

const normalizeStatus = (status?: string | null) =>
  status?.replace(/_/g, "").toLowerCase();

export const getStripeClientSecret = (response: unknown): string | undefined =>
  findClientSecret(response);

export const getStripePublishableKey = (
  response: unknown,
): string | undefined => findPublishableKey(response);

export const isSetupIntentSucceeded = (status?: string | null): boolean =>
  normalizeStatus(status) === "succeeded";

export const isPaymentIntentConfirmed = (status?: string | null): boolean => {
  const normalizedStatus = normalizeStatus(status);
  return (
    normalizedStatus === "succeeded" || normalizedStatus === "requirescapture"
  );
};

export const isStripeUserCancellation = (code?: string | null): boolean =>
  Boolean(code?.toLowerCase().includes("cancel"));

const STRIPE_GENERIC_PAYMENT_ERROR_MESSAGE =
  "We couldn't complete your payment. Please try again or use another payment method.";
const STRIPE_GENERIC_CARD_SETUP_ERROR_MESSAGE =
  "We couldn't save this card. Please try again or use another card.";

const STRIPE_SENSITIVE_DECLINE_CODES = new Set([
  "fraudulent",
  "lost_card",
  "merchant_blacklist",
  "pickup_card",
  "restricted_card",
  "stolen_card",
]);

const STRIPE_PAYMENT_ONLY_DECLINE_CODES = new Set([
  "card_velocity_exceeded",
  "duplicate_transaction",
  "insufficient_funds",
  "invalid_amount",
  "withdrawal_count_limit_exceeded",
]);

const STRIPE_DECLINE_MESSAGES: Record<string, string> = {
  authentication_not_handled:
    "Authentication failed. Please try again or use another payment method.",
  authentication_required:
    "Authentication failed. Please try again or use another payment method.",
  approve_with_id:
    "Your bank needs to approve this payment. Please contact your bank or use another card.",
  call_issuer:
    "Your bank declined this payment. Please contact your bank or use another card.",
  card_declined: "Your card was declined. Please contact your bank or use another card.",
  card_not_supported:
    "This card is not supported for this payment. Please use another card.",
  card_velocity_exceeded:
    "This card has reached its limit. Please use another payment method.",
  currency_not_supported:
    "This card does not support this currency. Please use another card.",
  duplicate_transaction:
    "This payment looks like a duplicate. Please check your booking before trying again.",
  expired_card: "This card has expired. Please use another card.",
  generic_decline:
    "Your card was declined. Please contact your bank or use another card.",
  do_not_honor:
    "Your bank declined this payment. Please contact your bank or use another card.",
  incorrect_address:
    "The billing address is incorrect. Please check it and try again.",
  incorrect_cvc:
    "The security code is incorrect. Please check it and try again.",
  incorrect_number:
    "The card number is incorrect. Please check it and try again.",
  incorrect_zip:
    "The billing postcode is incorrect. Please check it and try again.",
  insufficient_funds:
    "This card has insufficient funds. Please use another payment method.",
  invalid_account:
    "This card could not be used. Please contact your bank or use another card.",
  invalid_amount:
    "This payment amount could not be processed. Please use another payment method.",
  invalid_cvc:
    "The security code is incorrect. Please check it and try again.",
  invalid_expiry_month:
    "The expiry date is incorrect. Please check it and try again.",
  invalid_expiry_year:
    "The expiry date is incorrect. Please check it and try again.",
  invalid_number:
    "The card number is incorrect. Please check it and try again.",
  issuer_not_available:
    "Your bank could not be reached. Please try again or use another card.",
  new_account_information_available:
    "This card could not be used. Please contact your bank or use another card.",
  no_action_taken:
    "Your bank declined this payment. Please try again or use another card.",
  not_permitted:
    "This card cannot be used for this payment. Please contact your bank or use another card.",
  offline_pin_required:
    "This card requires PIN verification. Please use another payment method.",
  online_or_offline_pin_required:
    "This card requires PIN verification. Please use another payment method.",
  payment_intent_authentication_failure:
    "Authentication failed. Please try again or use another payment method.",
  payment_method_unactivated:
    "This payment method is not available. Please use another payment method.",
  payment_method_unexpected_state:
    "This payment method could not be used. Please use another payment method.",
  pin_try_exceeded:
    "This card has reached its PIN attempt limit. Please use another payment method.",
  processing_error:
    "We couldn't process the card. Please try again in a moment.",
  reenter_transaction:
    "We couldn't process this payment. Please try again or use another card.",
  revocation_of_all_authorizations:
    "Your bank declined this payment. Please contact your bank or use another card.",
  revocation_of_authorization:
    "Your bank declined this payment. Please contact your bank or use another card.",
  security_violation:
    "Your bank declined this payment. Please contact your bank or use another card.",
  service_not_allowed:
    "This card cannot be used for this payment. Please contact your bank or use another card.",
  setup_intent_authentication_failure:
    "Authentication failed. Please try again or use another payment method.",
  stop_payment_order:
    "Your bank declined this payment. Please contact your bank or use another card.",
  testmode_decline:
    "This test card was declined. Please use a different test card.",
  transaction_not_allowed:
    "This card cannot be used for this payment. Please contact your bank or use another card.",
  try_again_later:
    "Your bank could not process this payment right now. Please try again later or use another card.",
  withdrawal_count_limit_exceeded:
    "This card has reached its limit. Please use another payment method.",
};

const STRIPE_CARD_SETUP_MESSAGES: Record<string, string> = {
  authentication_not_handled:
    "Card authentication failed. Please try again or use another card.",
  authentication_required:
    "Card authentication failed. Please try again or use another card.",
  call_issuer:
    "Your bank declined this card. Please contact your bank or use another card.",
  card_declined:
    "Your bank declined this card. Please contact your bank or use another card.",
  card_not_supported:
    "This card is not supported. Please use another card.",
  do_not_honor:
    "Your bank declined this card. Please contact your bank or use another card.",
  expired_card: "This card has expired. Please use another card.",
  generic_decline:
    "Your bank declined this card. Please contact your bank or use another card.",
  incorrect_address:
    "The billing address is incorrect. Please check it and try again.",
  incorrect_cvc:
    "The security code is incorrect. Please check it and try again.",
  incorrect_number:
    "The card number is incorrect. Please check it and try again.",
  incorrect_zip:
    "The billing postcode is incorrect. Please check it and try again.",
  invalid_account:
    "This card could not be saved. Please contact your bank or use another card.",
  invalid_cvc:
    "The security code is incorrect. Please check it and try again.",
  invalid_expiry_month:
    "The expiry date is incorrect. Please check it and try again.",
  invalid_expiry_year:
    "The expiry date is incorrect. Please check it and try again.",
  invalid_number:
    "The card number is incorrect. Please check it and try again.",
  issuer_not_available:
    "Your bank could not be reached. Please try again or use another card.",
  new_account_information_available:
    "This card could not be saved. Please contact your bank or use another card.",
  no_action_taken:
    "Your bank declined this card. Please try again or use another card.",
  not_permitted:
    "This card cannot be saved. Please contact your bank or use another card.",
  offline_pin_required:
    "This card requires PIN verification. Please use another card.",
  online_or_offline_pin_required:
    "This card requires PIN verification. Please use another card.",
  payment_method_unactivated:
    "This payment method is not available. Please use another card.",
  payment_method_unexpected_state:
    "This card could not be saved. Please use another card.",
  processing_error:
    "We couldn't save this card right now. Please try again in a moment.",
  reenter_transaction:
    "We couldn't save this card. Please try again or use another card.",
  setup_intent_authentication_failure:
    "Card authentication failed. Please try again or use another card.",
  testmode_decline:
    "This test card was declined. Please use a different test card.",
  transaction_not_allowed:
    "This card cannot be saved. Please contact your bank or use another card.",
  try_again_later:
    "Your bank could not verify this card right now. Please try again later or use another card.",
};

const normalizeStripeErrorCode = (value?: unknown) =>
  typeof value === "string"
    ? value.trim().replace(/\s+/g, "_").toLowerCase()
    : undefined;

const findFirstStringByKeys = (
  value: unknown,
  keys: string[],
  visited = new Set<object>(),
): string | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  if (visited.has(value)) {
    return undefined;
  }

  visited.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const foundValue = findFirstStringByKeys(item, keys, visited);
      if (foundValue) {
        return foundValue;
      }
    }
    return undefined;
  }

  const recordValue = value as Record<string, unknown>;

  for (const [key, nestedValue] of Object.entries(recordValue)) {
    if (
      keys.includes(normalizeKey(key)) &&
      typeof nestedValue === "string" &&
      nestedValue.trim().length > 0
    ) {
      return nestedValue;
    }
  }

  for (const nestedValue of Object.values(recordValue)) {
    const foundValue = findFirstStringByKeys(nestedValue, keys, visited);
    if (foundValue) {
      return foundValue;
    }
  }

  return undefined;
};

const getStripeErrorPayloads = (error?: any): unknown[] => {
  const payloads: unknown[] = [];
  const addPayload = (value: unknown) => {
    if (value && !payloads.includes(value)) {
      payloads.push(value);
    }
  };

  if (error && typeof error === "object") {
    addPayload(error.response?.data);
    addPayload(error.data);
    addPayload(error.error);
    addPayload(error.lastPaymentError);
    addPayload(error.last_payment_error);
    addPayload(error.paymentIntent?.lastPaymentError);
    addPayload(error.payment_intent?.last_payment_error);
  }

  addPayload(error);

  return payloads;
};

const findFirstStringInStripePayloads = (error: unknown, keys: string[]) => {
  for (const payload of getStripeErrorPayloads(error)) {
    const foundValue = findFirstStringByKeys(payload, keys);

    if (foundValue) {
      return foundValue;
    }
  }

  return undefined;
};

const collectPayloadStrings = (
  value: unknown,
  visited = new Set<object>(),
): string[] => {
  if (typeof value === "string") {
    return [value];
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  if (visited.has(value)) {
    return [];
  }

  visited.add(value);

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectPayloadStrings(item, visited));
  }

  const strings: string[] = [];

  for (const [key, nestedValue] of Object.entries(value)) {
    strings.push(key);
    strings.push(...collectPayloadStrings(nestedValue, visited));
  }

  return strings;
};

const isSensitiveDeclineMessage = (message?: string) => {
  const normalizedMessage = message?.toLowerCase() || "";

  return ["fraud", "lost", "stolen", "restricted"].some((keyword) =>
    normalizedMessage.includes(keyword),
  );
};

const isTechnicalErrorMessage = (message?: string) => {
  const normalizedMessage = message?.toLowerCase() || "";

  return ["request failed with status code"].some((keyword) =>
    normalizedMessage.includes(keyword),
  );
};

const isPaymentOnlyDeclineMessage = (message?: string) => {
  const normalizedMessage = message?.toLowerCase() || "";

  return [
    "balance",
    "card_velocity",
    "duplicate",
    "duplicate_transaction",
    "funds",
    "insufficient",
    "insufficient fund",
    "insufficient_fund",
    "invalid_amount",
    "not enough",
    "payment amount",
    "reached its limit",
    "withdrawal",
    "withdrawal_count",
  ].some((keyword) => normalizedMessage.includes(keyword));
};

const hasPaymentOnlyDeclineSignal = (error?: unknown) =>
  getStripeErrorPayloads(error).some((payload) =>
    collectPayloadStrings(payload).some(isPaymentOnlyDeclineMessage),
  );

const getBackendStatusMessage = (error?: unknown) =>
  findFirstStringInStripePayloads(error, [
    "displaymessage",
    "statusmessage",
    "usermessage",
    "localizedmessage",
    "message",
  ]);

const getMappedStripeErrorMessage = (
  error?: any,
  fallbackMessage = STRIPE_GENERIC_PAYMENT_ERROR_MESSAGE,
  mappedMessages = STRIPE_DECLINE_MESSAGES,
  excludedCodes = new Set<string>(),
  shouldUseBackendStatusMessage = (message?: string) =>
    !isSensitiveDeclineMessage(message) && !isTechnicalErrorMessage(message),
): string => {
  const declineCode = normalizeStripeErrorCode(
    findFirstStringInStripePayloads(error, ["declinecode"]),
  );
  const errorCode = normalizeStripeErrorCode(
    findFirstStringInStripePayloads(error, [
      "stripeerrorcode",
      "code",
      "errorcode",
      "failurecode",
    ]),
  );

  const mappedCode = declineCode || errorCode;

  if (mappedCode && STRIPE_SENSITIVE_DECLINE_CODES.has(mappedCode)) {
    return fallbackMessage;
  }

  if (mappedCode && excludedCodes.has(mappedCode)) {
    return fallbackMessage;
  }

  if (mappedCode && mappedMessages[mappedCode]) {
    return mappedMessages[mappedCode];
  }

  const backendStatusMessage = getBackendStatusMessage(error);

  if (backendStatusMessage && shouldUseBackendStatusMessage(backendStatusMessage)) {
    return backendStatusMessage;
  }

  return fallbackMessage;
};

export const getStripeErrorMessage = (
  error?: any,
  fallbackMessage = STRIPE_GENERIC_PAYMENT_ERROR_MESSAGE,
): string => getMappedStripeErrorMessage(error, fallbackMessage);

export const getStripeCardSetupErrorMessage = (
  error?: any,
  fallbackMessage = STRIPE_GENERIC_CARD_SETUP_ERROR_MESSAGE,
): string => {
  if (hasPaymentOnlyDeclineSignal(error)) {
    return STRIPE_GENERIC_CARD_SETUP_ERROR_MESSAGE;
  }

  const safeFallbackMessage =
    isSensitiveDeclineMessage(fallbackMessage) ||
    isPaymentOnlyDeclineMessage(fallbackMessage)
      ? STRIPE_GENERIC_CARD_SETUP_ERROR_MESSAGE
      : fallbackMessage;

  return getMappedStripeErrorMessage(
    error,
    safeFallbackMessage,
    STRIPE_CARD_SETUP_MESSAGES,
    STRIPE_PAYMENT_ONLY_DECLINE_CODES,
    () => false,
  );
};

export const formatStripePlatformPayAmount = (
  amount: string | number,
): string => {
  const numericAmount = Number.parseFloat(
    String(amount).replace(/[^0-9.-]/g, ""),
  );

  return Number.isFinite(numericAmount) ? numericAmount.toFixed(2) : "0.00";
};
