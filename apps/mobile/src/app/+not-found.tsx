import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';


export default function NotFoundScreen() {

  
  return (
    <View className="flex-1 bg-white items-center justify-center p-5">
      <Text className="text-2xl font-bold mb-2 text-slate-900">Page Not Found</Text>
      <Text className="text-base text-center mb-8 text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </Text>
      
      <Link href="/" asChild>
        <Pressable className="bg-blue-500 px-6 py-3 rounded-lg">
          <Text className="text-white text-base font-semibold">Go Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}
