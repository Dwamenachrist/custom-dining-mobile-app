import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';

export default function LocationPermissionScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Location Permission Screen</Text>
      <Button title="Finish" variant="primary" onPress={() => router.replace('/(tabs)/home' as any)} style={{ width: 200, marginTop: 16 }} />
    </View>
  );
} 