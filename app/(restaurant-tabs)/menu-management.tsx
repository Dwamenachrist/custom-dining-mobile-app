import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useAuth } from '../../auth-context';
import api from '../../services/api';
import { getAssetFromMapping } from '../../services/assetMapping';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: any;
  isAvailable: boolean;
  dietaryTags?: string[];
};

export default function MenuManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const restaurantId = user?.restaurantId || '683c5e59a91c66e8f9486c17';
      console.log(' Loading menu items for restaurant:', restaurantId);
      
      const response = await api.get(`/meals/restaurant/${restaurantId}`);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        const convertedItems = response.data.map((item: any) => ({
          id: item._id || item.id,
          name: item.name,
          description: item.description,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          category: item.category || 'Main',
          image: getAssetFromMapping(item.name) || require('../../assets/meals/Basmati Jollof Rice.png'),
          isAvailable: item.isAvailable !== false,
          dietaryTags: item.dietaryTags || []
        }));
        
        setMenuItems(convertedItems);
        console.log(` Loaded ${convertedItems.length} menu items`);
      } else {
        // Fallback to sample data if no items found
        const sampleItems: MenuItem[] = [
          {
            id: '1',
            name: 'Basmati Jollof Rice',
            description: 'Premium basmati rice cooked in rich tomato sauce',
            price: 8500,
            category: 'Lunch',
            image: require('../../assets/meals/Basmati Jollof Rice.png'),
            isAvailable: true,
            dietaryTags: ['Traditional', 'Gluten-Free']
          },
          {
            id: '2',
            name: 'Fruity Oats Delight',
            description: 'Nourishing oats with fresh fruits and chia seeds',
            price: 5000,
            category: 'Breakfast',
            image: require('../../assets/meals/Fruity Oats delight.png'),
            isAvailable: true,
            dietaryTags: ['Healthy', 'Vegetarian']
          },
          {
            id: '3',
            name: 'Grilled Fish and Veggies',
            description: 'Fresh tilapia grilled with steamed vegetables',
            price: 9500,
            category: 'Dinner',
            image: require('../../assets/meals/Grilled Fish and Veggies.png'),
            isAvailable: false,
            dietaryTags: ['High-Protein', 'Omega-3']
          }
        ];
        setMenuItems(sampleItems);
        console.log(' Using sample menu items');
      }
    } catch (err: any) {
      console.error(' Error loading menu items:', err);
      setError(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const newAvailability = !item.isAvailable;
      
      // Optimistically update UI
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === item.id 
          ? { ...menuItem, isAvailable: newAvailability }
          : menuItem
      ));
      
      // Update backend
      const response = await api.put(`/meals/${item.id}`, {
        isAvailable: newAvailability
      });
      
      if (!response.success) {
        // Revert on failure
        setMenuItems(prev => prev.map(menuItem => 
          menuItem.id === item.id 
            ? { ...menuItem, isAvailable: !newAvailability }
            : menuItem
        ));
        Alert.alert('Error', 'Failed to update item availability');
      } else {
        console.log(` Updated ${item.name} availability to ${newAvailability}`);
      }
    } catch (error) {
      console.error(' Error toggling availability:', error);
      // Revert on error
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === item.id 
          ? { ...menuItem, isAvailable: !item.isAvailable }
          : menuItem
      ));
      Alert.alert('Error', 'Failed to update item availability');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    // Navigate to edit screen with item data
    router.push({
      pathname: '/add-meal',
      params: {
        editMode: 'true',
        itemId: item.id,
        itemName: item.name,
        itemDescription: item.description,
        itemPrice: item.price.toString(),
        itemCategory: item.category,
        itemTags: JSON.stringify(item.dietaryTags || [])
      }
    });
  };

  const handleDeleteItem = (item: MenuItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/meals/${item.id}`);
              
              if (response.success) {
                setMenuItems(prev => prev.filter(menuItem => menuItem.id !== item.id));
                console.log(` Deleted ${item.name}`);
              } else {
                Alert.alert('Error', 'Failed to delete item');
              }
            } catch (error) {
              console.error(' Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={[styles.menuItem, !item.isAvailable && styles.unavailable]}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.itemPrice}>{item.price.toLocaleString()}</Text>
          
          {/* Dietary Tags */}
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.dietaryTags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditItem(item)}
          >
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item)}
          >
            <Ionicons name="trash" size={18} color="#ff4444" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.availabilityButton, 
              !item.isAvailable && styles.unavailableButton
            ]}
            onPress={() => toggleAvailability(item)}
          >
            <Text style={[
              styles.availabilityText,
              !item.isAvailable && styles.unavailableText
            ]}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Menu Management</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading menu items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-meal')}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMenuItems}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadMenuItems}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant" size={64} color={colors.gray} />
              <Text style={styles.emptyTitle}>No Menu Items</Text>
              <Text style={styles.emptyText}>
                Start building your menu by adding your first item
              </Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => router.push('/add-meal')}
              >
                <Text style={styles.addFirstButtonText}>Add First Item</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.black,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.white,
    marginLeft: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.black,
  },
  itemDescription: {
    color: colors.darkGray,
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  availabilityButton: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unavailableButton: {
    backgroundColor: '#fee2e2',
  },
  availabilityText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  unavailableText: {
    color: '#dc2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});
