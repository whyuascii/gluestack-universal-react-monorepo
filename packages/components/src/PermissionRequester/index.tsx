/**
 * PermissionRequester Component
 *
 * Unified permission handling for camera, location, notifications, etc.
 * Shows appropriate dialogs and handles settings navigation.
 *
 * @example
 * ```tsx
 * // Using the hook
 * const { status, request, openSettings } = usePermission("camera");
 *
 * if (status === "denied") {
 *   return <PermissionDeniedView onOpenSettings={openSettings} />;
 * }
 *
 * // Using the component
 * <PermissionRequester
 *   permission="camera"
 *   onGranted={() => startCamera()}
 *   onDenied={() => showAlert()}
 * >
 *   {({ status, request }) => (
 *     <Button onPress={request}>Enable Camera</Button>
 *   )}
 * </PermissionRequester>
 * ```
 */

import React, { useEffect, useState, useCallback } from "react";
import { View, Platform, Linking, Alert } from "react-native";
import { Text } from "../text";
import { Button, ButtonText, ButtonIcon } from "../button";
import { VStack } from "../vstack";
import { Icon } from "../icon";
import { Camera, MapPin, Bell, Image, Users, Mic, Settings } from "lucide-react-native";

/**
 * Supported permission types
 */
export type PermissionType =
  | "camera"
  | "location"
  | "locationBackground"
  | "notifications"
  | "mediaLibrary"
  | "contacts"
  | "microphone";

/**
 * Permission status
 */
export type PermissionStatus = "undetermined" | "granted" | "denied" | "limited";

/**
 * Permission metadata for UI
 */
interface PermissionInfo {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  settingsMessage: string;
}

const permissionInfoMap: Record<PermissionType, PermissionInfo> = {
  camera: {
    title: "Camera Access",
    description: "We need camera access to take photos and scan codes.",
    icon: Camera,
    settingsMessage: "Please enable camera access in Settings to use this feature.",
  },
  location: {
    title: "Location Access",
    description: "We need your location to show nearby places and provide directions.",
    icon: MapPin,
    settingsMessage: "Please enable location access in Settings to use this feature.",
  },
  locationBackground: {
    title: "Background Location",
    description: "We need background location access to track your activity.",
    icon: MapPin,
    settingsMessage: "Please enable background location in Settings to use this feature.",
  },
  notifications: {
    title: "Notifications",
    description: "We'll send you important updates and reminders.",
    icon: Bell,
    settingsMessage: "Please enable notifications in Settings to receive updates.",
  },
  mediaLibrary: {
    title: "Photo Library",
    description: "We need access to your photos to let you select images.",
    icon: Image,
    settingsMessage: "Please enable photo library access in Settings to select photos.",
  },
  contacts: {
    title: "Contacts Access",
    description: "We need access to your contacts to help you connect with friends.",
    icon: Users,
    settingsMessage: "Please enable contacts access in Settings to use this feature.",
  },
  microphone: {
    title: "Microphone Access",
    description: "We need microphone access to record audio.",
    icon: Mic,
    settingsMessage: "Please enable microphone access in Settings to record audio.",
  },
};

/**
 * Dynamically load permission modules to avoid web errors
 */
const getPermissionModule = async (permission: PermissionType) => {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    switch (permission) {
      case "camera":
        // @ts-expect-error - Optional dependency, only available on native
        return await import("expo-camera");
      case "location":
      case "locationBackground":
        // @ts-expect-error - Optional dependency, only available on native
        return await import("expo-location");
      case "notifications":
        return await import("expo-notifications");
      case "mediaLibrary":
        // @ts-expect-error - Optional dependency, only available on native
        return await import("expo-media-library");
      case "contacts":
        // @ts-expect-error - Optional dependency, only available on native
        return await import("expo-contacts");
      case "microphone":
        // @ts-expect-error - Optional dependency, only available on native
        return await import("expo-av");
      default:
        return null;
    }
  } catch {
    return null;
  }
};

/**
 * Check permission status
 */
const checkPermission = async (permission: PermissionType): Promise<PermissionStatus> => {
  if (Platform.OS === "web") {
    return "granted"; // Web handles permissions differently
  }

  try {
    const module = await getPermissionModule(permission);
    if (!module) return "undetermined";

    let status: any;

    switch (permission) {
      case "camera":
        status = await (module as any).getCameraPermissionsAsync();
        break;
      case "location":
        status = await (module as any).getForegroundPermissionsAsync();
        break;
      case "locationBackground":
        status = await (module as any).getBackgroundPermissionsAsync();
        break;
      case "notifications":
        status = await (module as any).getPermissionsAsync();
        break;
      case "mediaLibrary":
        status = await (module as any).getPermissionsAsync();
        break;
      case "contacts":
        status = await (module as any).getPermissionsAsync();
        break;
      case "microphone":
        status = await (module as any).Audio.getPermissionsAsync();
        break;
    }

    if (status?.granted) return "granted";
    if (status?.status === "denied" || status?.canAskAgain === false) return "denied";
    return "undetermined";
  } catch {
    return "undetermined";
  }
};

/**
 * Request permission
 */
const requestPermission = async (permission: PermissionType): Promise<PermissionStatus> => {
  if (Platform.OS === "web") {
    return "granted";
  }

  try {
    const module = await getPermissionModule(permission);
    if (!module) return "denied";

    let status: any;

    switch (permission) {
      case "camera":
        status = await (module as any).requestCameraPermissionsAsync();
        break;
      case "location":
        status = await (module as any).requestForegroundPermissionsAsync();
        break;
      case "locationBackground":
        status = await (module as any).requestBackgroundPermissionsAsync();
        break;
      case "notifications":
        status = await (module as any).requestPermissionsAsync();
        break;
      case "mediaLibrary":
        status = await (module as any).requestPermissionsAsync();
        break;
      case "contacts":
        status = await (module as any).requestPermissionsAsync();
        break;
      case "microphone":
        status = await (module as any).Audio.requestPermissionsAsync();
        break;
    }

    if (status?.granted) return "granted";
    if (status?.status === "denied" || status?.canAskAgain === false) return "denied";
    return "undetermined";
  } catch {
    return "denied";
  }
};

/**
 * Open app settings
 */
const openAppSettings = async () => {
  if (Platform.OS === "ios") {
    await Linking.openURL("app-settings:");
  } else {
    await Linking.openSettings();
  }
};

/**
 * Hook for permission management
 */
export const usePermission = (permission: PermissionType) => {
  const [status, setStatus] = useState<PermissionStatus>("undetermined");
  const [isChecking, setIsChecking] = useState(true);

  const info = permissionInfoMap[permission];

  const check = useCallback(async () => {
    setIsChecking(true);
    const result = await checkPermission(permission);
    setStatus(result);
    setIsChecking(false);
    return result;
  }, [permission]);

  const request = useCallback(async () => {
    const currentStatus = await checkPermission(permission);

    if (currentStatus === "denied") {
      // Already denied, show settings dialog
      Alert.alert(info.title, info.settingsMessage, [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: openAppSettings },
      ]);
      return "denied";
    }

    const result = await requestPermission(permission);
    setStatus(result);
    return result;
  }, [permission, info]);

  useEffect(() => {
    check();
  }, [check]);

  return {
    status,
    isChecking,
    isGranted: status === "granted",
    isDenied: status === "denied",
    request,
    check,
    openSettings: openAppSettings,
    info,
  };
};

/**
 * PermissionRequester Props
 */
export interface PermissionRequesterProps {
  /** Permission type to request */
  permission: PermissionType;
  /** Called when permission is granted */
  onGranted?: () => void;
  /** Called when permission is denied */
  onDenied?: () => void;
  /** Render function */
  children: (props: {
    status: PermissionStatus;
    request: () => Promise<PermissionStatus>;
    openSettings: () => Promise<void>;
    info: PermissionInfo;
  }) => React.ReactNode;
}

/**
 * PermissionRequester Component
 */
export const PermissionRequester: React.FC<PermissionRequesterProps> = ({
  permission,
  onGranted,
  onDenied,
  children,
}) => {
  const { status, request, openSettings, info } = usePermission(permission);

  useEffect(() => {
    if (status === "granted") {
      onGranted?.();
    } else if (status === "denied") {
      onDenied?.();
    }
  }, [status, onGranted, onDenied]);

  return <>{children({ status, request, openSettings, info })}</>;
};

/**
 * Permission Request View - A pre-built UI for requesting permissions
 */
export interface PermissionRequestViewProps {
  permission: PermissionType;
  onGranted?: () => void;
  onSkip?: () => void;
}

export const PermissionRequestView: React.FC<PermissionRequestViewProps> = ({
  permission,
  onGranted,
  onSkip,
}) => {
  const { status, request, info, isChecking } = usePermission(permission);

  const handleRequest = async () => {
    const result = await request();
    if (result === "granted") {
      onGranted?.();
    }
  };

  if (isChecking) {
    return null;
  }

  if (status === "granted") {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center p-6 bg-surface-canvas">
      {/* Icon */}
      <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-6">
        <Icon as={info.icon} className="w-10 h-10 text-primary-500" />
      </View>

      {/* Title */}
      <Text className="text-heading-xl font-bold text-content-emphasis text-center mb-4">
        {info.title}
      </Text>

      {/* Description */}
      <Text className="text-body-md text-content-muted text-center mb-8 max-w-xs">
        {info.description}
      </Text>

      {/* Actions */}
      <VStack space="md" className="w-full max-w-xs">
        <Button onPress={handleRequest} size="lg" className="w-full">
          <ButtonText>Allow Access</ButtonText>
        </Button>

        {onSkip && (
          <Button onPress={onSkip} variant="outline" size="lg" className="w-full">
            <ButtonText>Maybe Later</ButtonText>
          </Button>
        )}

        {status === "denied" && (
          <Button onPress={openAppSettings} variant="link" className="w-full">
            <ButtonIcon as={Settings} />
            <ButtonText>Open Settings</ButtonText>
          </Button>
        )}
      </VStack>
    </View>
  );
};

export default PermissionRequester;
