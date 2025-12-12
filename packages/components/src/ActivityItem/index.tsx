import React from "react";
import type { TActivityItem } from "service-contracts";
import { Box } from "../box";
import { HStack } from "../hstack";
import { Text } from "../text";
import { VStack } from "../vstack";

interface ActivityItemProps {
  activity: TActivityItem;
}

const getActivityIcon = (type: TActivityItem["type"]) => {
  const icons = {
    task: "✓",
    project: "📁",
    comment: "💬",
    upload: "📎",
  };
  return icons[type];
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  return (
    <HStack space="md" className="p-3 border-b border-outline-100">
      <Box className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
        <Text size="xl">{getActivityIcon(activity.type)}</Text>
      </Box>
      <VStack className="flex-1">
        <Text size="sm" className="text-typography-900 font-medium">
          {activity.title}
        </Text>
        {activity.description && (
          <Text size="xs" className="text-typography-600">
            {activity.description}
          </Text>
        )}
        <Text size="xs" className="text-typography-500 mt-1">
          {formatTimeAgo(activity.timestamp)}
        </Text>
      </VStack>
    </HStack>
  );
};
