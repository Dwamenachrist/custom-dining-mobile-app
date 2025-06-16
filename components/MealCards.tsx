import { router } from 'expo-router';
import {View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Pressable} from 'react-native';


const recommendedMeals = [
  {
    id: 1,
    title: 'Avocado Veggie Bowl',
    image: require('../assets/recommendation1.png') ,
    tags: ['Low-Carb', ' Sugar-Free'],
  },
  {
    id: 2,
    title: 'Caesar Salad',
    image: require('../assets/recommendation2.png') ,
    tags: ['Low-Carb', 'Plant-Based'],
  },
  {
    id: 3,
    title: 'Stir Fry Tofu Rice',
    image: require('../assets/recommendation3.png') ,
    tags: ['Low-Carb', 'Sugar-Free']
  },
];

 const handleCardPress = (meal: { id : number}) => {
  router.push(`/meal/${meal.id}` as any);
};


export default function RecommendedMeals() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {recommendedMeals.map((meal) => (
        <TouchableOpacity
          key={meal.id}
          
          onPress={() => handleCardPress(meal)}
            style={styles.card}>
              <View style={styles.cardContent}>
            <View style={styles.leftSection}>
              <Text style={styles.title}>{meal.title}</Text>
              <View style={styles.tagRow}>
                {meal.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>{tag}</Text>
                ))}
              </View>
              <Pressable style={styles.addButton}>
                <Text style={styles.addButtonText}>Add to Plan</Text>
              </Pressable>
            </View>
            <Image source={meal.image} style={styles.image} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#DCF0DE',
    borderRadius: 16,
    padding: 10,
    marginRight: 16,
    width: 280,
    height: 120,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 6,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1A1A1A',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#DCFODE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#2E7D32',
    fontSize: 12,
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginLeft: 10,
  },
});

          