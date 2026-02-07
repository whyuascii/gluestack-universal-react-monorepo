/**
 * EmptyState Component
 *
 * Displays a friendly empty state for lists, search results, or any content area.
 * Highly customizable with icons, actions, and suggestions.
 *
 * @example
 * ```tsx
 * // Simple empty list
 * <EmptyState
 *   title="No items yet"
 *   message="Add your first item to get started"
 *   actionText="Add Item"
 *   onAction={() => setShowAddModal(true)}
 * />
 *
 * // Search with no results
 * <EmptyState
 *   icon={Search}
 *   title="No results found"
 *   message={`No results for "${searchQuery}"`}
 *   suggestions={["Check your spelling", "Try different keywords"]}
 * />
 * ```
 */

import { Bell, Heart, Inbox, Plus, Search } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { Button, ButtonIcon, ButtonText } from "../button";
import { HStack } from "../hstack";
import { Icon } from "../icon";
import { Text } from "../text";
import { VStack } from "../vstack";

export interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description/message text */
  message?: string;
  /** Custom icon component (defaults to Inbox) */
  icon?: React.ComponentType<any>;
  /** Icon color class */
  iconColorClass?: string;
  /** Icon background color class */
  iconBgClass?: string;
  /** Primary action button text */
  actionText?: string;
  /** Primary action callback */
  onAction?: () => void;
  /** Primary action icon */
  actionIcon?: React.ComponentType<any>;
  /** Secondary action text */
  secondaryActionText?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** List of suggestions to show */
  suggestions?: string[];
  /** Compact mode (smaller spacing) */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon: CustomIcon = Inbox,
  iconColorClass = "text-content-muted",
  iconBgClass = "bg-surface-sunken",
  actionText,
  onAction,
  actionIcon = Plus,
  secondaryActionText,
  onSecondaryAction,
  suggestions,
  compact = false,
  className = "",
}) => {
  const iconSize = compact ? "w-12 h-12" : "w-16 h-16";
  const iconInnerSize = compact ? "w-6 h-6" : "w-8 h-8";
  const spacing = compact ? "py-6" : "py-12";

  return (
    <View className={`items-center justify-center px-6 ${spacing} ${className}`}>
      {/* Icon */}
      <View className={`${iconSize} rounded-full items-center justify-center mb-4 ${iconBgClass}`}>
        <Icon as={CustomIcon} className={`${iconInnerSize} ${iconColorClass}`} />
      </View>

      {/* Title */}
      <Text
        className={`${compact ? "text-body-lg" : "text-heading-lg"} font-semibold text-content-emphasis text-center mb-2`}
      >
        {title}
      </Text>

      {/* Message */}
      {message && (
        <Text className="text-body-sm text-content-muted text-center mb-6 max-w-xs">{message}</Text>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <View className="mb-6 w-full max-w-xs">
          <VStack space="xs">
            {suggestions.map((suggestion, index) => (
              <HStack key={index} space="sm" className="items-start">
                <Text className="text-content-muted">•</Text>
                <Text className="text-body-sm text-content-muted flex-1">{suggestion}</Text>
              </HStack>
            ))}
          </VStack>
        </View>
      )}

      {/* Actions */}
      {(onAction || onSecondaryAction) && (
        <VStack space="sm" className="w-full max-w-xs">
          {onAction && actionText && (
            <Button onPress={onAction} size={compact ? "md" : "lg"} className="w-full">
              <ButtonIcon as={actionIcon} />
              <ButtonText>{actionText}</ButtonText>
            </Button>
          )}

          {onSecondaryAction && secondaryActionText && (
            <Button
              onPress={onSecondaryAction}
              variant="outline"
              size={compact ? "md" : "lg"}
              className="w-full"
            >
              <ButtonText>{secondaryActionText}</ButtonText>
            </Button>
          )}
        </VStack>
      )}
    </View>
  );
};

/**
 * Preset empty states for common scenarios
 */

export const EmptySearchResults: React.FC<{
  query?: string;
  onClear?: () => void;
}> = ({ query, onClear }) => {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      message={query ? `No results for "${query}"` : "Try a different search term"}
      suggestions={["Check your spelling", "Try more general keywords", "Remove some filters"]}
      actionText={onClear ? "Clear Search" : undefined}
      onAction={onClear}
    />
  );
};

export const EmptyList: React.FC<{
  itemName?: string;
  onAdd?: () => void;
}> = ({ itemName = "items", onAdd }) => {
  return (
    <EmptyState
      title={`No ${itemName} yet`}
      message={`Add your first ${itemName.slice(0, -1)} to get started`}
      actionText={onAdd ? `Add ${itemName.slice(0, -1)}` : undefined}
      onAction={onAdd}
    />
  );
};

export const EmptyNotifications: React.FC<{
  title?: string;
  message?: string;
}> = ({
  title = "No notifications",
  message = "You're all caught up! We'll notify you when something new happens.",
}) => {
  return <EmptyState icon={Bell} title={title} message={message} compact />;
};

export const EmptyFavorites: React.FC<{
  onExplore?: () => void;
}> = ({ onExplore }) => {
  return (
    <EmptyState
      icon={Heart}
      iconColorClass="text-error-icon"
      iconBgClass="bg-error-bg"
      title="No favorites yet"
      message="Items you favorite will appear here for quick access"
      actionText={onExplore ? "Explore" : undefined}
      onAction={onExplore}
    />
  );
};

export default EmptyState;
