/**
 * OfflineIndicator Component
 *
 * Displays a banner when the device is offline.
 * Automatically shows/hides based on network status.
 *
 * @example
 * ```tsx
 * // Basic usage - place at top of your app
 * <OfflineIndicator />
 *
 * // Custom styling
 * <OfflineIndicator
 *   message="You're offline"
 *   variant="minimal"
 *   position="bottom"
 * />
 *
 * // Using the hook directly
 * const { isOffline, isOnline } = useNetworkStatus();
 * if (isOffline) {
 *   // Show offline UI
 * }
 * ```
 */

import { RefreshCw, Wifi, WifiOff } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { NetworkError } from "../ErrorStates";
import { HStack } from "../hstack";
import { Icon } from "../icon";
import { Pressable } from "../pressable";
import { Text } from "../text";

/** NetInfo state shape from @react-native-community/netinfo */
interface NetInfoState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

/**
 * Network status hook
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupNetworkListener = async () => {
      // Only import NetInfo on native platforms
      if (Platform.OS === "web") {
        // Web uses navigator.onLine
        const handleOnline = () => {
          setIsConnected(true);
          setIsInternetReachable(true);
        };
        const handleOffline = () => {
          setIsConnected(false);
          setIsInternetReachable(false);
        };

        if (typeof window !== "undefined") {
          window.addEventListener("online", handleOnline);
          window.addEventListener("offline", handleOffline);

          // Initial state
          setIsConnected(navigator.onLine ?? true);
          setIsInternetReachable(navigator.onLine ?? true);

          unsubscribe = () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
          };
        }
      } else {
        try {
          // @ts-expect-error - Optional dependency, only available on native
          const NetInfo = await import("@react-native-community/netinfo");

          unsubscribe = NetInfo.default.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
          });
        } catch {
          // NetInfo not available, assume online
          setIsConnected(true);
          setIsInternetReachable(true);
        }
      }
    };

    setupNetworkListener();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOffline: isConnected === false || isInternetReachable === false,
    isOnline: isConnected === true && isInternetReachable !== false,
  };
};

export type OfflineIndicatorVariant = "banner" | "minimal" | "floating";
export type OfflineIndicatorPosition = "top" | "bottom";

export interface OfflineIndicatorProps {
  /** Visual variant */
  variant?: OfflineIndicatorVariant;
  /** Position of the indicator */
  position?: OfflineIndicatorPosition;
  /** Custom offline message */
  message?: string;
  /** Custom online message (shown briefly when reconnecting) */
  onlineMessage?: string;
  /** Show "back online" message when reconnecting */
  showOnlineMessage?: boolean;
  /** Duration to show online message (ms) */
  onlineMessageDuration?: number;
  /** Callback when retry is pressed */
  onRetry?: () => void;
  /** Show retry button */
  showRetry?: boolean;
  /** Custom className */
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  variant = "banner",
  position = "top",
  message = "No internet connection",
  onlineMessage = "Back online!",
  showOnlineMessage = true,
  onlineMessageDuration = 3000,
  onRetry,
  showRetry = false,
  className = "",
}) => {
  const { isOffline, isOnline } = useNetworkStatus();
  const [showingOnline, setShowingOnline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Track offline -> online transition
  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
      setIsVisible(true);
    } else if (wasOffline && showOnlineMessage) {
      // Show "back online" message
      setShowingOnline(true);
      const timer = setTimeout(() => {
        setShowingOnline(false);
        setWasOffline(false);
        setIsVisible(false);
      }, onlineMessageDuration);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOffline, wasOffline, showOnlineMessage, onlineMessageDuration]);

  // Don't render if online and not showing online message
  if (isOnline && !showingOnline && !wasOffline) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const isShowingOffline = isOffline && !showingOnline;
  const bgColor = isShowingOffline ? "bg-error-500" : "bg-success-500";
  const IconComponent = isShowingOffline ? WifiOff : Wifi;
  const displayMessage = isShowingOffline ? message : onlineMessage;

  // Variant-specific styling
  const variantStyles = {
    banner: "px-4 py-3",
    minimal: "px-3 py-2",
    floating: "mx-4 my-2 px-4 py-3 rounded-xl shadow-lg",
  };

  const positionStyles = {
    top: position === "top" ? "top-0 left-0 right-0" : "",
    bottom: position === "bottom" ? "bottom-0 left-0 right-0" : "",
  };

  return (
    <View className={`absolute ${positionStyles[position]} z-50 ${className}`}>
      <View className={`${bgColor} ${variantStyles[variant]}`}>
        <HStack space="sm" className="items-center justify-center">
          <Icon as={IconComponent} className="w-4 h-4 text-white" />
          <Text className="text-white text-body-sm font-medium">{displayMessage}</Text>
          {showRetry && isShowingOffline && onRetry && (
            <Pressable onPress={onRetry} className="ml-2">
              <Icon as={RefreshCw} className="w-4 h-4 text-white" />
            </Pressable>
          )}
        </HStack>
      </View>
    </View>
  );
};

/**
 * Offline-aware wrapper component
 * Shows offline screen when no connection, children when online
 */
export interface OfflineAwareProps {
  /** Content to show when online */
  children: React.ReactNode;
  /** Custom offline component */
  offlineComponent?: React.ReactNode;
  /** Callback to retry */
  onRetry?: () => void;
}

export const OfflineAware: React.FC<OfflineAwareProps> = ({
  children,
  offlineComponent,
  onRetry,
}) => {
  const { isOffline } = useNetworkStatus();

  if (isOffline) {
    if (offlineComponent) {
      return <>{offlineComponent}</>;
    }

    return <NetworkError onRetry={onRetry} />;
  }

  return <>{children}</>;
};

export default OfflineIndicator;
