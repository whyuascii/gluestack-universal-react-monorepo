"use client";

/**
 * PostLoginRouter - Decides where to route after login
 *
 * Checks if user has a tenant, pending invites, etc. and routes accordingly.
 */

import { Box, Spinner, VStack, Text } from "@app/components";
import React from "react";
import { usePostLoginRouter } from "../../../hooks/auth/usePostLoginRouter";

export interface PostLoginRouterProps {
  inviteToken?: string | null;
  onRouteDetermined: (route: { type: string; token?: string }) => void;
}

export const PostLoginRouter: React.FC<PostLoginRouterProps> = ({
  inviteToken,
  onRouteDetermined,
}) => {
  const { route, isLoading } = usePostLoginRouter({ inviteToken });

  React.useEffect(() => {
    if (route) {
      onRouteDetermined(route);
    }
  }, [route, onRouteDetermined]);

  if (isLoading) {
    return (
      <Box className="flex flex-1 items-center justify-center bg-surface-canvas min-h-screen">
        <VStack space="md" className="items-center">
          <Spinner size="large" />
          <Text size="lg" className="text-content-muted">
            Loading...
          </Text>
        </VStack>
      </Box>
    );
  }

  return null;
};

export default PostLoginRouter;
