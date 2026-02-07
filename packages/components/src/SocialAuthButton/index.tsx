import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

interface SocialAuthButtonProps {
  provider: "google" | "github";
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path
      d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.509h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
      fill="#4285F4"
    />
    <Path
      d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
      fill="#34A853"
    />
    <Path
      d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
      fill="#FBBC04"
    />
    <Path
      d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
      fill="#EA4335"
    />
  </Svg>
);

const GitHubIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
      fill="#ffffff"
    />
  </Svg>
);

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  onPress,
  isLoading = false,
  isDisabled = false,
}) => {
  const isGoogle = provider === "google";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.button,
        isGoogle ? styles.googleButton : styles.githubButton,
        (isDisabled || isLoading) && styles.disabledButton,
      ]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isGoogle ? "#374151" : "#ffffff"}
            style={styles.spinner}
          />
        ) : (
          <View style={styles.icon}>{isGoogle ? <GoogleIcon /> : <GitHubIcon />}</View>
        )}
        <Text style={[styles.text, isGoogle ? styles.googleText : styles.githubText]}>
          Continue with {isGoogle ? "Google" : "GitHub"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  googleButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  githubButton: {
    backgroundColor: "#24292f",
  },
  disabledButton: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 12,
  },
  spinner: {
    marginRight: 12,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
  },
  googleText: {
    color: "#1f2937",
  },
  githubText: {
    color: "#ffffff",
  },
});
