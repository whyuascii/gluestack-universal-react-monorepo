/**
 * Settings Mutation Hooks
 *
 * TanStack Query mutation hooks for settings actions using oRPC.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../../api";
import { queryKeys } from "../queries/keys";
import type {
  UpdateNotificationPreferencesInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
  UpdateTenantInput,
  UpdateLanguagePreferenceInput,
} from "@app/core-contract";

/**
 * Hook to update user's preferred language
 */
export function useUpdateLanguagePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateLanguagePreferenceInput) => {
      return client.private.user.settings.updateLanguagePreference(input);
    },
    onSuccess: () => {
      // Invalidate user data to refresh preferredLanguage
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.me(),
      });
    },
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateNotificationPreferencesInput) => {
      return client.private.user.settings.updateNotificationPreferences(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.notificationPreferences(),
      });
    },
  });
}

/**
 * Hook to update a member's role
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMemberRoleInput) => {
      return client.private.user.settings.updateMemberRole(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.members(),
      });
    },
  });
}

/**
 * Hook to remove a member from the group
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RemoveMemberInput) => {
      return client.private.user.settings.removeMember(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.members(),
      });
    },
  });
}

/**
 * Hook to update tenant/group name
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTenantInput) => {
      return client.private.user.settings.updateTenant(input);
    },
    onSuccess: () => {
      // Invalidate user data to refresh tenant info
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.me(),
      });
    },
  });
}

/**
 * Hook to leave the current group
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return client.private.user.settings.leaveGroup();
    },
    onSuccess: () => {
      // Invalidate user data to refresh tenant info
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.me(),
      });
    },
  });
}
