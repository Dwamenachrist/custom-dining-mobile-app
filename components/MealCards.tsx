import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

interface Meal {
  id: string;
  name: string;
  description: string;
  image: any;
  price: number;
  calories: number;
  tags: string[];
  restaurant: {
    id: string;
    name: string;
  };
}

interface MealCardProps {
  meals: Meal[];
  onMealPress: (meal: Meal) => void;
  onAddToPlan: (meal: Meal) => void;
  isLoading: boolean;
}

export default function MealCard({ meals, onMealPress, onAddToPlan, isLoading }: MealCardProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
      {meals.map((meal) => (
        <TouchableOpacity
          key={meal.id}
          onPress={() => onMealPress(meal)}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <View style={styles.leftSection}>
              <Text style={styles.title} numberOfLines={2}>{meal.name}</Text>
              <View style={styles.tagRow}>
                {meal.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tagContainer}>
                    <Text style={styles.tag}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Pressable 
                style={styles.addButton}
                onPress={() => onAddToPlan(meal)}
              >
                <Text style={styles.addButtonText}>Add to Plan</Text>
              </Pressable>
            </View>
            <View style={styles.imageContainer}>
              <Image source={meal.image} style={styles.image} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingRight: 16,
  },
  card: {
    backgroundColor: '#DCF0DE',
    borderRadius: 16,
    padding: 14,
    marginRight: 16,
    width: 300,
    height: 120,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
    paddingRight: 12,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
    alignItems: 'center',
  },
  tagContainer: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tag: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
  },
  addButtonText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
