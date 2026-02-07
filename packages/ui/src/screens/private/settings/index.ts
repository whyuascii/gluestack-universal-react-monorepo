/**
 * Settings Screen
 *
 * Cross-platform settings management for notifications, members, group, and account.
 */

export { SettingsScreen, type SettingsScreenProps } from "./SettingsScreen";
export { default } from "./SettingsScreen";

// Re-export sub-components for customization
export {
  NotificationSettings,
  MembersSettings,
  GroupSettings,
  AccountSettings,
} from "./components";
