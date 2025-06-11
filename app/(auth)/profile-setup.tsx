import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';

export default function ProfileSetupScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile Setup Screen</Text>
      <Button title="Next: Location Permission" variant="primary" onPress={() => router.push('/(auth)/location-permission')} style={{ width: 200, marginTop: 16 }} />
    </View>
  );
} 