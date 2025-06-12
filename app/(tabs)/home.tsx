import { View, ScrollView, Text, StyleSheet } from 'react-native';
import GreetingHeader from '../../components/Greeting';
import Category from '../../components/Categories';
import RestaurantCard from '../../components/RestaurantCards';
import MealCard from '../../components/MealCards';


export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GreetingHeader name="Dina" />
      <Category/> 
      
      <Text style={styles.sectionTitle}>Recommended For You</Text>
       <MealCard/>
      
      <Text style={styles.sectionTitle}>Top Restaurants</Text>
      <RestaurantCard/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
});
