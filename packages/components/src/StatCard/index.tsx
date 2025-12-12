import React from "react";
import { Card } from "../card";
import { Heading } from "../heading";
import { Text } from "../text";
import { VStack } from "../vstack";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
  return (
    <Card className="p-4 bg-primary-50 rounded-xl border border-primary-200">
      <VStack space="xs">
        <Text size="sm" className="text-typography-600 font-medium">
          {title}
        </Text>
        <Heading size="2xl" className="text-primary-900">
          {value}
        </Heading>
        {subtitle && (
          <Text size="xs" className="text-typography-500">
            {subtitle}
          </Text>
        )}
      </VStack>
    </Card>
  );
};
