"use client";

import { VStack, HStack, Heading, Text, Box, ScrollView, Spinner } from "@app/components";
import { AppHeader, StatCard, ActivityItem, PrimaryButton } from "@app/components";
import React from "react";
import { useDashboard, useLogout } from "../hooks";
import { useAuthStore } from "../store/authStore";

export const DashboardScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError } = useDashboard();
  const logoutMutation = useLogout();

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
            <HStack space="md" className="flex-wrap">
              <Box className="flex-1 min-w-[150px]">
                <StatCard title="Total Tasks" value={stats.totalTasks} subtitle="All tasks" />
              </Box>
              <Box className="flex-1 min-w-[150px]">
                <StatCard
                  title="Completed"
                  value={stats.completedTasks}
                  subtitle={`${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% done`}
                />
              </Box>
              <Box className="flex-1 min-w-[150px]">
                <StatCard
                  title="Active Projects"
                  value={stats.activeProjects}
                  subtitle="In progress"
                />
              </Box>
            </HStack>
          </VStack>

          {/* Primary Action */}
          <PrimaryButton
            onPress={() => {
              // eslint-disable-next-line no-alert
              (globalThis as any).alert?.("Create new task!");
            }}
          >
            Create New Task
          </PrimaryButton>

          {/* Recent Activity */}
          <VStack space="xs">
            <Heading size="lg" className="text-typography-900">
              Recent Activity
            </Heading>
            {recentActivity.length === 0 ? (
              <Box className="p-8 items-center justify-center bg-background-50 rounded-xl">
                <Text size="md" className="text-typography-500">
                  No recent activity
                </Text>
              </Box>
            ) : (
              <Box className="bg-white rounded-xl overflow-hidden">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </Box>
            )}
          </VStack>

          {/* Logout Button */}
          <PrimaryButton
            onPress={() => logoutMutation.mutate()}
            isLoading={logoutMutation.isPending}
            variant="outline"
          >
            Sign Out
          </PrimaryButton>
        </VStack>
      </ScrollView>
    </Box>
  );
};
