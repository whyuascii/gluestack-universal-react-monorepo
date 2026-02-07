/**
 * Email Templates
 */

// Auth templates
export { AuthVerifyEmail as authVerifyEmail } from "./verify-email";
export { AuthResetPassword as authResetPassword } from "./reset-password";
export { AuthWelcome as authWelcome } from "./welcome";
export { InviteToTenant as inviteToTenant } from "./invite";
export { WaitlistWelcome as waitlistWelcome } from "./waitlist";

// Admin templates
export { AdminInviteEmail as adminInviteEmail } from "./admin-invite";

// Subscription templates
export { SubscriptionActivated as subscriptionActivated } from "./subscription-activated";
export { PaymentFailed as paymentFailed } from "./payment-failed";
export { TrialEnding as trialEnding } from "./trial-ending";
