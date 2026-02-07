/**
 * Subscription Error Types
 *
 * Typed error handling for RevenueCat operations
 * These error codes match RevenueCat SDK error codes
 */

/**
 * RevenueCat error codes
 * @see https://www.revenuecat.com/docs/api/errors
 */
export enum PurchaseErrorCode {
  /** Unknown error occurred */
  UNKNOWN = "UNKNOWN",

  /** User cancelled the purchase flow */
  PURCHASE_CANCELLED = "PURCHASE_CANCELLED",

  /** Store not available (network issues, account issues) */
  STORE_PROBLEM = "STORE_PROBLEM",

  /** Purchase not allowed (parental controls, etc.) */
  PURCHASE_NOT_ALLOWED = "PURCHASE_NOT_ALLOWED",

  /** Product not available in the store */
  PRODUCT_NOT_AVAILABLE = "PRODUCT_NOT_AVAILABLE",

  /** Already purchased this non-consumable */
  PRODUCT_ALREADY_PURCHASED = "PRODUCT_ALREADY_PURCHASED",

  /** Receipt validation failed */
  RECEIPT_ALREADY_IN_USE = "RECEIPT_ALREADY_IN_USE",

  /** Invalid receipt data */
  INVALID_RECEIPT = "INVALID_RECEIPT",

  /** Payment is pending (e.g., waiting for approval) */
  PAYMENT_PENDING = "PAYMENT_PENDING",

  /** Missing receipt file */
  MISSING_RECEIPT_FILE = "MISSING_RECEIPT_FILE",

  /** Network error connecting to RevenueCat */
  NETWORK_ERROR = "NETWORK_ERROR",

  /** Invalid credentials (API key) */
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",

  /** Operation not allowed in current state */
  OPERATION_ALREADY_IN_PROGRESS = "OPERATION_ALREADY_IN_PROGRESS",

  /** RevenueCat SDK not configured */
  NOT_CONFIGURED = "NOT_CONFIGURED",

  /** App Store configuration error */
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",

  /** Store Kit 2 transaction not found */
  STOREKIT2_TRANSACTION_NOT_FOUND = "STOREKIT2_TRANSACTION_NOT_FOUND",

  /** Running in Expo Go (SDK not available) */
  EXPO_GO_NOT_SUPPORTED = "EXPO_GO_NOT_SUPPORTED",
}

/**
 * Purchase error with typed error code
 */
export class PurchaseError extends Error {
  readonly code: PurchaseErrorCode;
  readonly underlyingError: unknown;
  readonly userInfo?: Record<string, unknown>;

  constructor(
    code: PurchaseErrorCode,
    message: string,
    underlyingError?: unknown,
    userInfo?: Record<string, unknown>
  ) {
    super(message);
    this.name = "PurchaseError";
    this.code = code;
    this.underlyingError = underlyingError;
    this.userInfo = userInfo;
  }

  /**
   * Check if the error is user-cancellable (not a real error)
   */
  get isCancelled(): boolean {
    return this.code === PurchaseErrorCode.PURCHASE_CANCELLED;
  }

  /**
   * Check if the error is a network issue
   */
  get isNetworkError(): boolean {
    return (
      this.code === PurchaseErrorCode.NETWORK_ERROR || this.code === PurchaseErrorCode.STORE_PROBLEM
    );
  }

  /**
   * Check if the error is recoverable (user can retry)
   */
  get isRecoverable(): boolean {
    return (
      this.isNetworkError ||
      this.code === PurchaseErrorCode.STORE_PROBLEM ||
      this.code === PurchaseErrorCode.PAYMENT_PENDING
    );
  }

  /**
   * Check if the error requires configuration fix
   */
  get isConfigurationError(): boolean {
    return (
      this.code === PurchaseErrorCode.INVALID_CREDENTIALS ||
      this.code === PurchaseErrorCode.NOT_CONFIGURED ||
      this.code === PurchaseErrorCode.CONFIGURATION_ERROR ||
      this.code === PurchaseErrorCode.EXPO_GO_NOT_SUPPORTED
    );
  }

  /**
   * Get user-friendly error message
   */
  get userMessage(): string {
    switch (this.code) {
      case PurchaseErrorCode.PURCHASE_CANCELLED:
        return "Purchase was cancelled.";
      case PurchaseErrorCode.STORE_PROBLEM:
        return "Unable to connect to the store. Please check your internet connection and try again.";
      case PurchaseErrorCode.PURCHASE_NOT_ALLOWED:
        return "Purchases are not allowed on this device. Please check your device settings.";
      case PurchaseErrorCode.PRODUCT_NOT_AVAILABLE:
        return "This product is currently unavailable. Please try again later.";
      case PurchaseErrorCode.PRODUCT_ALREADY_PURCHASED:
        return "You've already purchased this item. Try restoring your purchases.";
      case PurchaseErrorCode.NETWORK_ERROR:
        return "Network error. Please check your internet connection and try again.";
      case PurchaseErrorCode.PAYMENT_PENDING:
        return "Your payment is pending approval. You'll get access once it's approved.";
      case PurchaseErrorCode.EXPO_GO_NOT_SUPPORTED:
        return "Subscriptions are not available in Expo Go. Please use a development build.";
      default:
        return "Something went wrong. Please try again later.";
    }
  }
}

/**
 * Parse RevenueCat SDK error into typed PurchaseError
 */
export function parsePurchaseError(error: unknown): PurchaseError {
  // Already a PurchaseError
  if (error instanceof PurchaseError) {
    return error;
  }

  // RevenueCat SDK error object
  if (error && typeof error === "object" && "code" in error) {
    const rcError = error as {
      code: number | string;
      message?: string;
      userInfo?: Record<string, unknown>;
    };

    // Map RevenueCat error codes
    const code = mapRevenueCatErrorCode(rcError.code);
    const message = rcError.message || getDefaultMessageForCode(code);

    return new PurchaseError(code, message, error, rcError.userInfo);
  }

  // Generic error
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes("cancelled") || error.message.includes("canceled")) {
      return new PurchaseError(PurchaseErrorCode.PURCHASE_CANCELLED, error.message, error);
    }
    if (error.message.includes("network") || error.message.includes("Network")) {
      return new PurchaseError(PurchaseErrorCode.NETWORK_ERROR, error.message, error);
    }

    return new PurchaseError(PurchaseErrorCode.UNKNOWN, error.message, error);
  }

  // Unknown error type
  return new PurchaseError(PurchaseErrorCode.UNKNOWN, String(error), error);
}

/**
 * Map RevenueCat SDK error code to our enum
 */
function mapRevenueCatErrorCode(code: number | string): PurchaseErrorCode {
  // String codes
  if (typeof code === "string") {
    if (code in PurchaseErrorCode) {
      return code as PurchaseErrorCode;
    }
    return PurchaseErrorCode.UNKNOWN;
  }

  // Numeric codes from RevenueCat SDK
  switch (code) {
    case 1:
      return PurchaseErrorCode.PURCHASE_CANCELLED;
    case 2:
      return PurchaseErrorCode.STORE_PROBLEM;
    case 3:
      return PurchaseErrorCode.PURCHASE_NOT_ALLOWED;
    case 4:
      return PurchaseErrorCode.PRODUCT_NOT_AVAILABLE;
    case 5:
      return PurchaseErrorCode.PRODUCT_ALREADY_PURCHASED;
    case 6:
      return PurchaseErrorCode.RECEIPT_ALREADY_IN_USE;
    case 7:
      return PurchaseErrorCode.INVALID_RECEIPT;
    case 8:
      return PurchaseErrorCode.PAYMENT_PENDING;
    case 9:
      return PurchaseErrorCode.MISSING_RECEIPT_FILE;
    case 10:
      return PurchaseErrorCode.NETWORK_ERROR;
    case 11:
      return PurchaseErrorCode.INVALID_CREDENTIALS;
    case 21:
      return PurchaseErrorCode.OPERATION_ALREADY_IN_PROGRESS;
    case 23:
      return PurchaseErrorCode.NOT_CONFIGURED;
    case 24:
      return PurchaseErrorCode.CONFIGURATION_ERROR;
    default:
      return PurchaseErrorCode.UNKNOWN;
  }
}

/**
 * Get default message for error code
 */
function getDefaultMessageForCode(code: PurchaseErrorCode): string {
  switch (code) {
    case PurchaseErrorCode.PURCHASE_CANCELLED:
      return "User cancelled the purchase";
    case PurchaseErrorCode.STORE_PROBLEM:
      return "Problem connecting to the store";
    case PurchaseErrorCode.PURCHASE_NOT_ALLOWED:
      return "Purchase not allowed";
    case PurchaseErrorCode.PRODUCT_NOT_AVAILABLE:
      return "Product not available";
    case PurchaseErrorCode.PRODUCT_ALREADY_PURCHASED:
      return "Product already purchased";
    case PurchaseErrorCode.NETWORK_ERROR:
      return "Network error";
    case PurchaseErrorCode.PAYMENT_PENDING:
      return "Payment pending";
    case PurchaseErrorCode.NOT_CONFIGURED:
      return "RevenueCat not configured";
    case PurchaseErrorCode.EXPO_GO_NOT_SUPPORTED:
      return "Not supported in Expo Go";
    default:
      return "Unknown error";
  }
}

/**
 * Check if error should be logged (not user-initiated)
 */
export function shouldLogError(error: PurchaseError): boolean {
  // Don't log user cancellations
  if (error.isCancelled) {
    return false;
  }

  // Don't log expected configuration issues in dev
  if (__DEV__ && error.isConfigurationError) {
    return false;
  }

  return true;
}
