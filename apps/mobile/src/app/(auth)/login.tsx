import { signIn, useSession } from "@app/auth/client/native";
import { ROUTES } from "@app/ui";
import { useRouter, type Href } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

// Temporary simple login for debugging
function SimpleLogin({
  onNavigateToSignup,
  onLoginSuccess,
  signIn: performSignIn,
}: {
  onNavigateToSignup: () => void;
  onLoginSuccess?: () => void;
  signIn: (params: {
    email: string;
    password: string;
  }) => Promise<{ error?: { message?: string } }>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await performSignIn({ email, password });
      if (result.error) {
        setError(result.error.message || "Login failed");
      } else {
        onLoginSuccess?.();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateToSignup} style={styles.link}>
          <Text style={styles.linkText}>Don&apos;t have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666666",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#999999",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#dc2626",
    fontSize: 14,
  },
  error: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },
});

export default function Login() {
  const router = useRouter();
  const { refetch } = useSession();

  const handleLoginSuccess = useCallback(async () => {
    // Refetch session to update the auth state before navigating
    await refetch();
    router.replace(ROUTES.POST_LOGIN.mobile as Href);
  }, [refetch, router]);

  // Use SimpleLogin for now to debug, then switch back to LoginScreen
  return (
    <SimpleLogin
      onNavigateToSignup={() => router.push(ROUTES.SIGNUP.mobile as Href)}
      onLoginSuccess={handleLoginSuccess}
      signIn={({ email, password }) => signIn.email({ email, password })}
    />
  );

  // Original LoginScreen - uncomment once debugging is done
  // return (
  //   <LoginScreen
  //     onNavigateToSignup={() => router.push(ROUTES.SIGNUP.mobile as Href)}
  //     onLoginSuccess={handleLoginSuccess}
  //     signIn={({ email, password }) => signIn.email({ email, password })}
  //   />
  // );
}
