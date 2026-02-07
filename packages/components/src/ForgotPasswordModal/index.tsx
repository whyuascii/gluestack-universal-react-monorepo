import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "../box";
import { Button, ButtonText } from "../button";
import { FormField } from "../FormField";
import { Heading } from "../heading";
import { HStack } from "../hstack";
import { Icon, CloseIcon, CheckCircleIcon } from "../icon";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "../modal";
import { Text } from "../text";
import { VStack } from "../vstack";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setError("");
      setIsSuccess(false);
      setCountdown(0);
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async () => {
    setError("");
    setIsSuccess(false); // Ensure we reset success state

    // Validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError(t("validation:email.invalid"));
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(email);
      // Only set success if onSubmit completes without error
      setIsSuccess(true);
      setCountdown(60);
      setError(""); // Clear any previous errors
    } catch (err) {
      // Explicitly keep isSuccess false and show error
      setIsSuccess(false);
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setCountdown(60);
    try {
      await onSubmit(email);
      setError(""); // Clear errors on successful resend
    } catch (err) {
      setIsSuccess(false); // Stay in error state
      setError(err instanceof Error ? err.message : "Failed to resend email");
      setCountdown(0); // Stop countdown on error
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-w-md">
        <ModalHeader>
          <Heading size="lg" className="text-typography-900">
            {isSuccess ? t("forgotPassword.successTitle") : t("forgotPassword.title")}
          </Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} className="text-typography-600" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          {isSuccess ? (
            <VStack space="md">
              <Box className="flex justify-center mb-4">
                <Icon as={CheckCircleIcon} className="w-16 h-16 text-success-600" />
              </Box>
              <Text className="text-center text-typography-700">
                {t("forgotPassword.successMessage", { email })}
              </Text>
              <Text size="sm" className="text-center text-typography-600">
                {t("forgotPassword.resendHelper", { seconds: countdown })}
              </Text>
              {countdown === 0 ? (
                <Button onPress={handleResend} className="bg-primary-600 rounded-lg py-2">
                  <ButtonText className="text-white font-semibold">
                    {t("forgotPassword.resend")}
                  </ButtonText>
                </Button>
              ) : null}
            </VStack>
          ) : (
            <VStack space="md">
              <Text className="text-typography-700">{t("forgotPassword.description")}</Text>
              <FormField
                label={t("forgotPassword.email")}
                value={email}
                onChangeText={setEmail}
                error={error}
                placeholder={t("forgotPassword.emailPlaceholder")}
                keyboardType="email-address"
              />
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          {isSuccess ? (
            <Button onPress={onClose} className="w-full bg-primary-600 rounded-lg py-3">
              <ButtonText className="text-white font-semibold">
                {t("forgotPassword.backToLogin")}
              </ButtonText>
            </Button>
          ) : (
            <HStack space="md" className="w-full">
              <Button
                onPress={onClose}
                className="flex-1 bg-transparent border border-outline-300 rounded-lg py-3"
              >
                <ButtonText className="text-typography-700">
                  {t("forgotPassword.cancel")}
                </ButtonText>
              </Button>
              <Button
                onPress={handleSubmit}
                isDisabled={isLoading}
                className="flex-1 bg-primary-600 rounded-lg py-3"
              >
                {isLoading ? <ButtonText className="text-white mr-2">⏳</ButtonText> : null}
                <ButtonText className="text-white font-semibold">
                  {t("forgotPassword.submit")}
                </ButtonText>
              </Button>
            </HStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
