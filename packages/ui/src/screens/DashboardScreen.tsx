"use client";

import { auth, getUser, type Session } from "@app/auth";
import { VStack, HStack, Heading, Text, Box, ScrollView, Spinner } from "@app/components";
import { AppHeader, StatCard, ActivityItem, PrimaryButton } from "@app/components";
import React from "react";
import { useDashboard } from "../hooks";

interface DashboardScreenProps {
  session: Session | null;
  onLogoutSuccess?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ session, onLogoutSuccess }) => {
  const user = getUser(session);
  const { data, isLoading, isError } = useDashboard(session);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      onLogoutSuccess?.();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-0 p-4">
        <VStack space="md" className="items-center">
          <Text size="lg" className="text-error-600">
            Failed to load dashboard
          </Text>
          <PrimaryButton
            onPress={() => {
              (globalThis as any).window?.location?.reload();
            }}
          >
            Retry
          </PrimaryButton>
        </VStack>
      </Box>
    );
  }

  const { stats, recentActivity } = data;

  return (
    <Box className="flex-1 bg-background-0">
      <AppHeader title="Dashboard" user={user || undefined} />

      <ScrollView className="flex-1">
        <VStack space="lg" className="p-4">
          {/* Stats Cards */}
          <VStack space="xs">
            <Heading size="lg" className="text-typography-900">
              Overview
            </Heading>
            <Text size="sm" className="text-typography-600">
              Your nest at a glance
            </Text>
          </VStack>

          <VStack space="md">
            <Box>
              <Heading size="md" className="text-typography-700">
                Total Tasks
              </Heading>
              <Text size="2xl" className="text-primary-600 font-bold">
                {stats.totalTasks}
              </Text>
            </Box>
            <Box>
              <Heading size="md" className="text-typography-700">
                Completed Tasks
              </Heading>
              <Text size="2xl" className="text-success-600 font-bold">
                {stats.completedTasks}
              </Text>
            </Box>
            <Box>
              <Heading size="md" className="text-typography-700">
                Active Projects
              </Heading>
              <Text size="2xl" className="text-info-600 font-bold">
                {stats.activeProjects}
              </Text>
            </Box>
          </VStack>

          {/* Recent Activity */}
          <VStack space="md" className="mt-4">
            <Heading size="lg" className="text-typography-900">
              Recent Activity
            </Heading>

            {recentActivity.length === 0 ? (
              <Box className="p-8 items-center">
                <Text size="sm" className="text-typography-500 text-center">
                  No recent activity yet
                </Text>
              </Box>
            ) : (
              <VStack space="sm">
                {recentActivity.map((activity, index) => (
                  <Box key={index} className="p-4 bg-background-50 rounded-lg">
                    <Text className="font-semibold">{activity.type}</Text>
                    <Text size="sm" className="text-typography-600">
                      {activity.title}
                    </Text>
                    {activity.description && (
                      <Text size="xs" className="text-typography-500">
                        {activity.description}
                      </Text>
                    )}
                    <Text size="xs" className="text-typography-400">
                      {activity.timestamp.toLocaleString()}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </VStack>

          {/* Logout Button */}
          <Box className="mt-4">
            <PrimaryButton onPress={handleLogout}>Logout</PrimaryButton>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
};
