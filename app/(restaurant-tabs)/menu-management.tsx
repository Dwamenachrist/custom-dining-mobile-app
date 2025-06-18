import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
};

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Fresh tomatoes, mozzarella, basil',
    price: 14.99,
    category: 'Pizza',
    image: 'https://via.placeholder.com/100',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Romaine lettuce, croutons, parmesan',
    price: 8.99,
    category: 'Salads',
    image: 'https://via.placeholder.com/100',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Spaghetti Carbonara',
    description: 'Eggs, pecorino cheese, pancetta, black pepper',
    price: 16.99,
    category: 'Pasta',
    image: 'https://via.placeholder.com/100',
    isAvailable: false,
  },
];

export default function MenuScreen() {
  const router = useRouter();

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={[styles.menuItem, !item.isAvailable && styles.unavailable]}>
      <Image
        source={{ uri: item.image }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {/* Handle edit */}}
          >
            <Ionicons name="pencil" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.availabilityButton, !item.isAvailable && styles.unavailableButton]}
            onPress={() => {/* Handle availability toggle */}}
          >
            <Text style={styles.availabilityText}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <TouchableOpacity 
          style={styles.addButton}
                          onPress={() => router.push('/add-meal')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={mockMenuItems}
        renderItem={renderMenuItem}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unavailable: {
    opacity: 0.6,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  availabilityButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unavailableButton: {
    backgroundColor: '#FFEBEE',
  },
  availabilityText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
}); 