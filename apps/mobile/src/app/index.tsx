import { useSession } from "@app/auth/client/native";
import { ROUTES } from "@app/ui";
import { Redirect, type Href } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";

export default function Index() {
  const { data: session, isPending } = useSession();

  // Show loading indicator while checking session
  if (isPending) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={{ marginTop: 12, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  // Mobile goes directly to login or dashboard (no marketing home page)
  if (session) {
    return <Redirect href={ROUTES.DASHBOARD.mobile as Href} />;
  }

  return <Redirect href={ROUTES.LOGIN.mobile as Href} />;
}
