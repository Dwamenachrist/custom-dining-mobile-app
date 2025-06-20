import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from '../../components/TextInput';
import { useRouter } from 'expo-router';
import { useCart } from '../../cart-context';

export default function CartScreen() {
  const { items: cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const [selectedId, setSelectedId] = useState(cartItems.length > 0 ? cartItems[0].meal.id : ''); 
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [pickup, setPickup] = useState(false);
  const [delivery, setDelivery] = useState(true);

  const router = useRouter();

  // Quantity adjustment handlers
  function changeQuantity(id: string, delta: number) {
    const item = cartItems.find((item: any) => item.meal.id === id);
    if (item) {
      const newQuantity = item.quantity + delta;
      updateQuantity(id, newQuantity);
    }
  }

  // Calculate costs
  const subtotal = getTotalPrice();
  const deliveryFee = delivery ? 1500 : 0;
  const pickupFee = pickup ? 0 : 1500;
  const total = subtotal + deliveryFee;

  // If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name={'arrow-back'} size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Empty State */}
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="basket-outline" size={80} color={colors.gray} />
          <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">Your cart is empty</Text>
          <Text className="text-gray-600 text-center mb-8 leading-6">
            Browse our recommended meals and add items to your cart to get started.
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/meal/recommended')}
            className="bg-green-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Browse Meals</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name={'arrow-back'} size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">

        {/* Cart Items */}
        {cartItems.map((item) => {
          const isSelected = selectedId === item.meal.id;
          return (
            <View key={item.meal.id} style={styles.cartItem}>
              {/* Radio */}
              <TouchableOpacity
                style={styles.radioCircle}
                onPress={() => setSelectedId(item.meal.id)}
                activeOpacity={0.7}
              >
                {isSelected && <View style={styles.radioCircleSelected} />}
              </TouchableOpacity>

              {/* Image */}
              <View className="w-15 h-15 rounded-full overflow-hidden mr-3">
                <Image source={item.meal.image} style={styles.itemImage} />
              </View>

              {/* Details */}
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.meal.name}</Text>
                <Text style={styles.itemSubtitle}>{item.meal.restaurant}</Text>

                {/* Quantity control */}
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    onPress={() => changeQuantity(item.meal.id, -1)}
                    style={styles.qtyButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyNumber}>{item.quantity}</Text>

                  <TouchableOpacity
                    onPress={() => changeQuantity(item.meal.id, 1)}
                    style={styles.qtyButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price */}
              <Text style={styles.itemPrice}>₦{(item.meal.price * item.quantity).toLocaleString()}</Text>

              {/* Remove icon (X) */}
              <TouchableOpacity onPress={() => {
                removeFromCart(item.meal.id);
                if (selectedId === item.meal.id && cartItems.length > 1) {
                  const remainingItems = cartItems.filter(i => i.meal.id !== item.meal.id);
                  if (remainingItems.length > 0) {
                    setSelectedId(remainingItems[0].meal.id);
                  }
                }
              }} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          );
        })}

      </ScrollView>

      {/* Special Instructions Input */}
      <View style={{ marginHorizontal: 18, marginTop: 12 }}>
      <TextInput
        placeholder="Add special instructions (e.g. no salt, extra spicy)"
        placeholderTextColor={colors.gray}
        multiline
        value={specialInstructions}
        onChangeText={setSpecialInstructions}
        returnKeyType="done"
      />
      </View>

      {/* Delivery Options (vertical, inside summary container) */}
        <View style={styles.deliveryOptionsContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => {
              setPickup(true);
              setDelivery(false);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, pickup && { backgroundColor: colors.primary }]}> 
              {pickup && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.optionLabel}>Pickup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => {
              setDelivery(true);
              setPickup(false);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, delivery && { backgroundColor: colors.primary }]}> 
              {delivery && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.optionLabel}>Delivery</Text>
          </TouchableOpacity>
        </View>

      {/* Summary and Checkout Section with Curved Top */}
      <View style={styles.summaryContainer}>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₦{subtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{pickup ? 'Pickup Fee' : 'Delivery Fee'}</Text>
          <Text style={styles.summaryValue}>₦{pickup ? pickupFee.toLocaleString() : deliveryFee.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Total</Text>
          <Text style={[styles.summaryValue, { fontWeight: '700' }]}>₦{total.toLocaleString()}</Text>
        </View>

        {/* Checkout Button */}
        <Button
          title="Proceed to Checkout"
          variant="primary"
          onPress={() => {
            router.push(`/checkout?subtotal=${subtotal}&deliveryFee=${deliveryFee}&total=${total}&deliveryAddress=${encodeURIComponent('24 Oriahi Street, Lekki, Lagos State.')}`);
          }}
          style={{ borderRadius: 8, marginTop: 16 }}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollArea: {
    flex: 1,
    marginTop: 12,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.black,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    backgroundColor: colors.lightGray,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 20,
    color: colors.darkGray,
    lineHeight: 18,
  },
  qtyNumber: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  itemPrice: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  removeBtn: {
    marginLeft: 8,
  },
  removeBtnText: {
    fontSize: 20,
    color: colors.gray,
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginTop: 16,
    
  },
  deliveryOptionsContainer: {
    marginBottom: 12,
    marginLeft: 18,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Stack vertically
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTick: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: colors.black,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
    backgroundColor: '#f9fbfa',
    paddingHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.darkGray,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.darkGray,
  },
  checkoutContainer: {
    paddingVertical: 16,
  },
});