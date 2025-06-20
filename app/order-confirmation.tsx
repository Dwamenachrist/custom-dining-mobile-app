import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Checkmark */}
      <View style={styles.checkCircle}>
        <Ionicons name="checkmark" size={32} color={colors.white} />
      </View>
      {/* Title */}
      <Text style={styles.title}>Order Confirmed</Text>
      {/* Subtext */}
      <Text style={styles.subtext}>Your order has been{"\n"}Successfully placed!</Text>
      {/* Divider */}
      <View style={styles.divider} />
      {/* Food Item */}
      <View style={styles.foodRow}>
        <Image
          source={require('../assets/order-confirmed.png')}
          style={styles.foodImage}
        />
        <View style={{ marginLeft: 12, justifyContent: 'center' }}>
          <Text style={styles.foodTitle}>Almond swallow & Vegetable soup</Text>
          <Text style={styles.foodSubtitle}>Dammy's kitchen</Text>
        </View>
      </View>
      {/* Button */}
      <Button
        title="Continue Shopping"
        variant="primary"
        style={styles.button}
        onPress={() => router.replace('/(customer-tabs)/home' as any)} // Go to home or shopping page
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    width: '100%',
    marginVertical: 18,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    alignSelf: 'center',
  },
  foodImage: {
    width: 118,
    height: 100,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 2,
  },
  foodSubtitle: {
    fontSize: 14,
    color: colors.gray,
  },
  button: {
    width: '100%',
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 0,
    alignSelf: 'center',
  },
}); 