// Platform-specific re-export
// This file is used by bundlers to resolve the correct platform version

export {
  refreshSubscription,
  syncPurchases,
  restorePurchases,
  loginUser,
  logoutUser,
  hasActiveEntitlement,
  getCustomerInfo,
  resetSubscriptionState,
  setUserAttributes,
  getAnonymousUserId,
} from "./sync.native";
