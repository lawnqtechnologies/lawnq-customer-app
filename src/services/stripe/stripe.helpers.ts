import { LQ_API } from "@env";

export const STRIPE_URL_SCHEME = "app.lawnq";
export const STRIPE_RETURN_URL = `${STRIPE_URL_SCHEME}://safepay`;
export const STRIPE_MERCHANT_IDENTIFIER = "merchant.com.app.lawnq";
export const STRIPE_MERCHANT_NAME = "LawnQ";
export const STRIPE_MERCHANT_COUNTRY_CODE = "AU";
export const STRIPE_CURRENCY_CODE = "AUD";
export const STRIPE_PAYMENT_TYPE_CARD = "card";
export const STRIPE_PAYMENT_TYPE_NATIVE_PAY = "native_pay";

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

export const assertStripePublishableKeySafeForCurrentBuild = (
  publishableKey?: string | null,
): string => {
  if (!publishableKey) {
    throw new Error("Stripe publishable key was not returned.");
  }

  if (
    STRIPE_PLATFORM_PAY_TEST_ENV &&
    isStripeLivePublishableKey(publishableKey)
  ) {
    throw new Error("Live Stripe publishable key blocked in test environment.");
  }

  return publishableKey;
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

  const currentValue = value as Record<string, unknown>;
  const keyName = currentValue.StripeKeyName || currentValue.stripeKeyName;
  const stripeKey = currentValue.StripeKey || currentValue.stripeKey;

  if (keyName === "PublishableKey" && typeof stripeKey === "string") {
    return stripeKey;
  }

  for (const [key, nestedValue] of Object.entries(currentValue)) {
    if (
      normalizeKey(key) === "publishablekey" &&
      typeof nestedValue === "string" &&
      nestedValue.length > 0
    ) {
      return nestedValue;
    }
  }

  for (const nestedValue of Object.values(currentValue)) {
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

export const getStripeErrorMessage = (error: any): string =>
  error?.message || "Stripe authentication failed. Please try again.";

export const formatStripePlatformPayAmount = (
  amount: string | number,
): string => {
  const numericAmount = Number.parseFloat(
    String(amount).replace(/[^0-9.-]/g, ""),
  );

  return Number.isFinite(numericAmount) ? numericAmount.toFixed(2) : "0.00";
};

const redactStripeDebugValue = (
  value: unknown,
  visited = new Set<object>(),
): unknown => {
  if (typeof value === "string") {
    const parsedValue = parseJsonString(value);

    if (parsedValue) {
      return redactStripeDebugValue(parsedValue, visited);
    }

    return value.replace(
      STRIPE_CLIENT_SECRET_PATTERN,
      "[stripe_client_secret_redacted]",
    );
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (visited.has(value)) {
    return "[Circular]";
  }

  visited.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactStripeDebugValue(item, visited));
  }

  return Object.entries(value).reduce<Record<string, unknown>>(
    (debugValue, [key, nestedValue]) => {
      const normalizedKey = normalizeKey(key);

      debugValue[key] =
        normalizedKey.includes("clientsecret") &&
        typeof nestedValue === "string"
          ? "[stripe_client_secret_redacted]"
          : redactStripeDebugValue(nestedValue, visited);

      return debugValue;
    },
    {},
  );
};

export const logStripeDebugResponse = (
  label: string,
  response: unknown,
  clientSecret?: string,
) => {
  if (!__DEV__) {
    return;
  }

  console.log(
    `[StripeDebug] ${label}`,
    JSON.stringify(
      {
        extractedClientSecret: Boolean(clientSecret),
        response: redactStripeDebugValue(response),
      },
      null,
      2,
    ),
  );
};
