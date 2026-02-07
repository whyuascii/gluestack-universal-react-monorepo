import { VStack, Heading, Text, Button, ButtonText, ButtonSpinner } from "@app/components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, ActivityIndicator } from "react-native";

export interface InviteDetails {
  token: string;
  groupName: string;
  inviterName: string;
}

export interface InviteAcceptScreenProps {
  token: string;
  isAuthenticated: boolean;
  inviteDetails?: InviteDetails;
  loading?: boolean;
  error?: string;
  onAccept: (token: string) => Promise<void>;
  onSignup: () => void;
  onLogin: () => void;
  onSuccess: () => void;
}

export const InviteAcceptScreen: React.FC<InviteAcceptScreenProps> = ({
  token,
  isAuthenticated,
  inviteDetails,
  loading: externalLoading = false,
  error: externalError,
  onAccept,
  onSignup,
  onLogin,
  onSuccess,
}) => {
  const { t } = useTranslation("group");
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | undefined>();

  const handleAccept = async () => {
    setAcceptError(undefined);
    setAccepting(true);

    try {
      await onAccept(token);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setAcceptError(error?.message || t("accept.errors.invalid"));
    } finally {
      setAccepting(false);
    }
  };

  // Loading state
  if (externalLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface-canvas">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Error state
  if (externalError || !inviteDetails) {
    return (
      <View className="flex-1 p-6 justify-center bg-surface-canvas">
        <VStack space="lg" className="max-w-md w-full mx-auto">
          <Heading size="xl" className="text-center text-error-600">
            {externalError === "expired"
              ? t("accept.errors.expired")
              : externalError === "already_member"
                ? t("accept.errors.alreadyMember")
                : t("accept.errors.invalid")}
          </Heading>

          <Button size="lg" onPress={onSuccess}>
            <ButtonText>Go to Dashboard</ButtonText>
          </Button>
        </VStack>
      </View>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <View className="flex-1 p-6 justify-center bg-surface-canvas">
        <VStack space="xl" className="max-w-md w-full mx-auto">
          <VStack space="sm">
            <Heading size="2xl" className="text-center text-content-emphasis">
              {t("accept.title")}
            </Heading>
            <Text className="text-center text-content text-lg">
              {t("accept.subtitle", {
                inviter: inviteDetails.inviterName,
                groupName: inviteDetails.groupName,
              })}
            </Text>
            <Text className="text-center text-content-muted">{t("accept.description")}</Text>
          </VStack>

          <VStack space="md">
            <Button size="lg" onPress={onSignup}>
              <ButtonText>{t("accept.actions.signup")}</ButtonText>
            </Button>

            <Button variant="outline" size="lg" onPress={onLogin}>
              <ButtonText>{t("accept.actions.login")}</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </View>
    );
  }

  // Authenticated - show accept button
  return (
    <View className="flex-1 p-6 justify-center bg-surface-canvas">
      <VStack space="xl" className="max-w-md w-full mx-auto">
        <VStack space="sm">
          <Heading size="2xl" className="text-center text-content-emphasis">
            {t("accept.title")}
          </Heading>
          <Text className="text-center text-content text-lg">
            {t("accept.subtitle", {
              inviter: inviteDetails.inviterName,
              groupName: inviteDetails.groupName,
            })}
          </Text>
          <Text className="text-center text-content-muted">{t("accept.description")}</Text>
        </VStack>

        {acceptError && <Text className="text-error-600 text-center">{acceptError}</Text>}

        <Button size="lg" onPress={handleAccept} isDisabled={accepting}>
          {accepting && <ButtonSpinner />}
          <ButtonText>{accepting ? t("accept.accepting") : t("accept.acceptButton")}</ButtonText>
        </Button>
      </VStack>
    </View>
  );
};
