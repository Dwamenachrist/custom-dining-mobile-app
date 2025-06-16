import { View, Text } from 'react-native';
import { Button } from '~/components/Button';
import { useRouter } from 'expo-router';


export default function OrderScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Order Screen</Text>
      <Button
        title="Go to cart"
        onPress={() => {
          const router = useRouter();
          router.push('/checkout');
        }}
      />
    </View>
  );
} 