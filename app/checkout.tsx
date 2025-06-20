import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';

export default function CheckoutScreen() {
  const router = useRouter();
  const { subtotal = '0', deliveryFee = '0', total = '0', deliveryAddress = '' } = useLocalSearchParams();

  // Payment method state
  const [selectedPayment, setSelectedPayment] = useState<'visa' | 'mastercard' | 'new'>('new');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [addCard, setAddCard] = useState(true);

  // Dummy saved cards
  const savedCards = [
    { type: 'visa', last4: '4269', icon: <FontAwesome name="cc-visa" size={24} color="#1a1f71" /> },
    { type: 'mastercard', last4: '5302', icon: <FontAwesome name="cc-mastercard" size={24} color="#eb001b" /> },
  ];

  const handleEditAddress = () => {
    // Navigate to address editing screen
    router.push({
      pathname: '/location-search',
      params: {
        returnTo: '/checkout',
        currentAddress: deliveryAddress,
        subtotal,
        deliveryFee,
        total
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* Delivery Address */}
        <View style={styles.addressBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.addressLabel}>Delivery Address</Text>
            <TouchableOpacity onPress={handleEditAddress} activeOpacity={0.7}>
              <MaterialIcons name="edit" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleEditAddress} activeOpacity={0.8}>
            <Text style={styles.addressText}>
              {deliveryAddress ? decodeURIComponent(deliveryAddress as string) : 'Tap to add delivery address'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>
        <Text style={styles.savedCardsLabel}>Saved Cards</Text>
        <View style={{ marginBottom: 8 }}>
          {savedCards.map((card, idx) => (
            <TouchableOpacity
              key={card.type}
              style={styles.cardRow}
              onPress={() => setSelectedPayment(card.type as 'visa' | 'mastercard')}
              activeOpacity={0.7}
            >
              {card.icon}
              <Text style={styles.cardNumber}>*****{card.last4}</Text>
              <View style={styles.radioOuter}>
                {selectedPayment === card.type && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => setSelectedPayment('new')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="credit-card" size={24} color={colors.primary} />
            <Text style={styles.cardNumber}>Pay with a new card</Text>
            <View style={styles.radioOuter}>
              {selectedPayment === 'new' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Payment Details */}
        <Text style={styles.sectionTitle}>Payment details</Text>
        {selectedPayment === 'new' && (
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={styles.input}
              placeholder="Card Holder Name"
              placeholderTextColor={colors.gray}
              value={cardName}
              onChangeText={setCardName}
            />
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor={colors.gray}
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={setCardNumber}
              maxLength={19}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Expiry Date"
                placeholderTextColor={colors.gray}
                value={expiry}
                onChangeText={setExpiry}
                maxLength={5}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="CVV"
                placeholderTextColor={colors.gray}
                value={cvv}
                onChangeText={setCvv}
                maxLength={4}
                secureTextEntry
              />
            </View>
            <TouchableOpacity
              style={styles.addCardRow}
              onPress={() => setAddCard((v) => !v)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, addCard && { backgroundColor: colors.primary, borderColor: colors.primary }]}> 
                {addCard && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.addCardLabel}>Add card</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₦{Number(subtotal).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₦{Number(deliveryFee).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Total</Text>
            <Text style={[styles.summaryValue, { fontWeight: '700' }]}>₦{Number(total).toLocaleString()}</Text>
          </View>
          {/* Place Order Button */}
        <Button
          title="Place Order"
          variant="primary"
          style={{ borderRadius: 6, marginTop: 16, marginBottom: 8 }}
          onPress={() => router.push('/order-confirmation')}
        />
        </View>

        

        
      </ScrollView>
      {/* Security Note */}
      <View style={styles.securityRow}>
          <Image source={require('../assets/secured.png')} style={{ width: 20, height: 20, marginRight: 6 }} />
          <Text style={styles.securityText}>Your payment is encrypted and secure</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  addressBox: {
    backgroundColor: '#f7faf8',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
  },
  addressLabel: {
    fontWeight: '600',
    color: colors.black,
    fontSize: 15,
    marginBottom: 2,
  },
  addressText: {
    color: colors.darkGray,
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
  },
  savedCardsLabel: {
    color: colors.darkGray,
    fontWeight: '600',
    fontSize: 14,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  cardNumber: {
    marginLeft: 8,
    fontSize: 15,
    color: colors.black,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 15,
    color: colors.black,
    backgroundColor: '#fff',
  },
  addCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
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
    backgroundColor: '#fff',
  },
  checkboxTick: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  addCardLabel: {
    fontSize: 15,
    color: colors.black,
  },
  summaryBox: {
    backgroundColor: '#f9fbfa',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.darkGray,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.darkGray,
  },
  securityRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 44,
  },
  securityText: {
    color: colors.primary,
    fontSize: 14,
    marginLeft: 2,
  },
}); 