import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';

const mapImage = require('../assets/map.png');
const foodImage = require('../assets/order-confirmed.png');
const riderImage = require('../assets/on-the-way.png');
const packageImage = require('../assets/order-arrived.png');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F0' },
  map: {
    width: '100%',
    height: 270,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginTop: 16,
    marginBottom: -32,
    zIndex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
    zIndex: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
    color: '#222',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 4,
    justifyContent: 'center',
  },
  progressStep: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 6,
  },
  activeStep: {
    backgroundColor: '#3A7752',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 18,
    color: '#222',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F7F5F0',
    borderRadius: 12,
    padding: 10,
  },
  foodImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  qty: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  confirmButton: {
    backgroundColor: '#3A7752',
    borderRadius: 8,
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

type StatusKey = 'preparing' | 'onTheWay' | 'arrived';
interface StatusConfig {
  title: string;
  progress: boolean[];
  content: React.ReactNode;
}

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  preparing: {
    title: 'Preparing your order!',
    progress: [true, false, false],
    content: (
      <View style={styles.itemRow}>
        <Image source={foodImage} style={styles.foodImage} />
        <View>
          <Text style={styles.foodName}>Almond flour swallow</Text>
          <Text style={styles.foodName}>Vegetable soup</Text>
        </View>
        <View style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
          <Text style={styles.qty}>1x</Text>
          <Text style={styles.qty}>1x</Text>
        </View>
      </View>
    ),
  },
  onTheWay: {
    title: 'Your order is on its way!',
    progress: [true, true, false],
    content: (
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Image source={riderImage} style={{ width: 120, height: 120 }} />
      </View>
    ),
  },
  arrived: {
    title: 'Your order has arrived!',
    progress: [true, true, true],
    content: (
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Image source={packageImage} style={{ width: 120, height: 120 }} />
        <TouchableOpacity style={styles.confirmButton} onPress={() => router.replace('/home')}>
          <Text style={styles.confirmButtonText}>Confirm Package</Text>
        </TouchableOpacity>
      </View>
    ),
  },
};

export default function OrderStatus() {
  const params = useLocalSearchParams();
  const stepParam = params.step;
  const step: StatusKey =
    typeof stepParam === 'string' && ['preparing', 'onTheWay', 'arrived'].includes(stepParam)
      ? (stepParam as StatusKey)
      : 'preparing';
  const config = STATUS_CONFIG[step];

  return (
    <SafeAreaView style={styles.container}>
      <Image source={mapImage} style={styles.map} />
      <View style={styles.card}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>{config.title}</Text>
        <View style={styles.progressBar}>
          {config.progress.map((active: boolean, idx: number) => (
            <View
              key={idx}
              style={[
                styles.progressStep,
                active && styles.activeStep,
              ]}
            />
          ))}
        </View>
        <Text style={styles.orderNumber}>Order #00001</Text>
        {config.content}
      </View>
    </SafeAreaView>
  );
}