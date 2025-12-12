import React from "react";
import { Button, ButtonText, ButtonSpinner } from "../button";

interface PrimaryButtonProps {
  onPress: () => void;
  children: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: "solid" | "outline";
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onPress,
  children,
  isLoading = false,
  isDisabled = false,
  variant = "solid",
}) => {
  return (
    <Button
      onPress={onPress}
      isDisabled={isDisabled || isLoading}
      className={`w-full py-3 rounded-full ${
        variant === "solid"
          ? "bg-primary-600 active:bg-primary-700"
          : "border-2 border-primary-600 bg-transparent"
      }`}
    >
      {isLoading && <ButtonSpinner className="mr-2" />}
      <ButtonText
        className={`font-semibold ${variant === "solid" ? "text-white" : "text-primary-600"}`}
      >
        {children}
      </ButtonText>
    </Button>
  );
};
