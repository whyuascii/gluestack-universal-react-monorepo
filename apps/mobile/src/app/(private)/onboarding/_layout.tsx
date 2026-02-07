import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";

/**
 * Onboarding Layout - Stack navigation for post-login onboarding flow
 *
 * Screens:
 * - index: PostLoginRouter (decides next step)
 * - create-group: Create a new group/tenant
 * - invite-members: Invite members to the group
 */
export default function OnboardingLayout() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="create-group" />
        <Stack.Screen name="invite-members" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
