import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Order = {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  time: string;
};

const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'John Doe',
    items: ['Vegetarian Pizza', 'Greek Salad'],
    total: 32.50,
    status: 'pending',
    time: '10:30 AM'
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    items: ['Chicken Burger', 'Fries', 'Coke'],
    total: 25.75,
    status: 'preparing',
    time: '10:15 AM'
  },
  {
    id: '3',
    customerName: 'Mike Johnson',
    items: ['Pasta Carbonara', 'Garlic Bread'],
    total: 28.90,
    status: 'ready',
    time: '10:00 AM'
  }
];

export default function OrdersScreen() {
  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.orderTime}>{item.time}</Text>
      </View>
      
      <View style={styles.itemsList}>
        {item.items.map((itemName, index) => (
          <Text key={index} style={styles.itemText}>• {itemName}</Text>
        ))}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>${item.total.toFixed(2)}</Text>
        <View style={[styles.statusBadge, styles[item.status]]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>
      
      <FlatList
        data={mockOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderTime: {
    color: '#666',
  },
  itemsList: {
    marginBottom: 12,
  },
  itemText: {
    color: '#666',
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pending: {
    backgroundColor: '#FFA000',
  },
  preparing: {
    backgroundColor: '#1976D2',
  },
  ready: {
    backgroundColor: '#2E7D32',
  },
  delivered: {
    backgroundColor: '#757575',
  },
}); 