// Comprehensive backend data inspector
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function inspectBackendData() {
  console.log('🔍 INSPECTING YOUR BACKEND DATA...\n');
  console.log('='.repeat(60));
  
  try {
    // Fetch meals
    console.log('🍽️ MEALS ENDPOINT: /api/meals');
    const mealsResponse = await fetch('https://custom-dining.onrender.com/api/meals');
    const mealsData = await mealsResponse.json();
    
    console.log(`📊 Status: ${mealsData.status}`);
    console.log(`📊 Total Meals: ${mealsData.results}`);
    console.log('\n📋 DETAILED MEAL DATA:');
    console.log('-'.repeat(40));
    
    mealsData.data.forEach((meal, index) => {
      console.log(`\n${index + 1}. MEAL ID: ${meal.id}`);
      console.log(`   Name: "${meal.name}"`);
      console.log(`   Description: "${meal.description}"`);
      console.log(`   Price: ₦${meal.price}`);
      console.log(`   Available: ${meal.isAvailable === 1 ? 'Yes' : 'No'}`);
      console.log(`   Restaurant ID: ${meal.restaurantId}`);
      console.log(`   Restaurant Name: ${meal.restaurant?.name || 'Not provided'}`);
      console.log(`   Restaurant Location: ${meal.restaurant?.location || 'Not provided'}`);
      console.log(`   Created: ${meal.createdAt}`);
      console.log(`   Updated: ${meal.updatedAt}`);
      console.log(`   Dietary Tags: [${meal.dietaryTags.join(', ')}]`);
      console.log(`   Allergens: [${meal.allergens.join(', ')}]`);
      console.log(`   Nutrition:`);
      console.log(`     - Calories: ${meal.nutritionalInfo?.calories || 'Not provided'}`);
      console.log(`     - Protein: ${meal.nutritionalInfo?.protein || 'Not provided'}g`);
      console.log(`     - Carbs: ${meal.nutritionalInfo?.carbs || 'Not provided'}g`);
      console.log(`     - Fat: ${meal.nutritionalInfo?.fat || 'Not provided'}g`);
      console.log(`   Image URL: ${meal.imageUrl || 'NOT PROVIDED'}`);
    });
    
    // Fetch restaurants
    console.log('\n' + '='.repeat(60));
    console.log('🏪 RESTAURANTS ENDPOINT: /api/restaurants');
    const restaurantsResponse = await fetch('https://custom-dining.onrender.com/api/restaurants');
    const restaurantsData = await restaurantsResponse.json();
    
    console.log(`📊 Status: ${restaurantsData.status}`);
    console.log(`📊 Total Restaurants: ${restaurantsData.results}`);
    console.log('\n📋 DETAILED RESTAURANT DATA:');
    console.log('-'.repeat(40));
    
    restaurantsData.data.restaurants.forEach((restaurant, index) => {
      console.log(`\n${index + 1}. RESTAURANT ID: ${restaurant.restaurantId}`);
      console.log(`   Name: "${restaurant.restaurantName}"`);
      console.log(`   Location: "${restaurant.location}"`);
      console.log(`   Cuisine Type: "${restaurant.cuisineType}"`);
      console.log(`   Contact Email: ${restaurant.contactEmail}`);
      console.log(`   Status: ${restaurant.status}`);
      console.log(`   Active: ${restaurant.isActive ? 'Yes' : 'No'}`);
      console.log(`   Owner ID: ${restaurant.owner.id}`);
      console.log(`   Owner Username: ${restaurant.owner.username}`);
      console.log(`   Owner Email: ${restaurant.owner.email}`);
      console.log(`   Image URL: ${restaurant.imageUrl || 'NOT PROVIDED'}`);
      console.log(`   Cover Image: ${restaurant.coverImageUrl || 'NOT PROVIDED'}`);
      console.log(`   Rating: ${restaurant.rating || 'NOT PROVIDED'}`);
      console.log(`   Review Count: ${restaurant.reviewCount || 'NOT PROVIDED'}`);
      console.log(`   Delivery Time: ${restaurant.deliveryTime || 'NOT PROVIDED'}`);
    });
    
    // Summary and recommendations
    console.log('\n' + '='.repeat(60));
    console.log('🎯 BACKEND ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n✅ WHAT YOUR BACKEND HAS:');
    console.log(`   • ${mealsData.results} meals (all "${mealsData.data[0]?.name}")`);
    console.log(`   • ${restaurantsData.results} restaurants (${restaurantsData.data.restaurants.filter(r => r.isActive).length} active)`);
    console.log('   • Basic meal info (name, price, description)');
    console.log('   • Restaurant info (name, location, cuisine)');
    console.log('   • Dietary tags and allergens');
    console.log('   • Basic nutrition (calories, protein)');
    
    console.log('\n❌ WHAT YOUR BACKEND IS MISSING:');
    console.log('   • Image URLs for meals');
    console.log('   • Image URLs for restaurants');
    console.log('   • Restaurant ratings');
    console.log('   • Restaurant review counts');
    console.log('   • Delivery time estimates');
    console.log('   • More meal variety (only Plantain elubo)');
    console.log('   • Complete nutrition info (carbs, fat)');
    
    console.log('\n🚀 RECOMMENDATIONS:');
    console.log('   1. OPTION A: Add more meals to backend (18 total like frontend)');
    console.log('   2. OPTION B: Use hybrid approach (backend data + local assets)');
    console.log('   3. OPTION C: Build local mock API with 18 meals for now');
    
    console.log('\n📊 FRONTEND vs BACKEND:');
    console.log(`   Frontend expects: ~18 meals`);
    console.log(`   Backend provides: ${mealsData.results} meals`);
    console.log(`   Gap: ${18 - mealsData.results} meals missing`);
    
    // Check if backend has user endpoints
    console.log('\n🔍 CHECKING OTHER ENDPOINTS...');
    
    try {
      const userMealsResponse = await fetch('https://custom-dining.onrender.com/api/user/meals');
      console.log(`✅ /api/user/meals: ${userMealsResponse.status}`);
    } catch (e) {
      console.log(`❌ /api/user/meals: Error - ${e.message}`);
    }
    
    try {
      const favoritesResponse = await fetch('https://custom-dining.onrender.com/api/users/favorites');
      console.log(`✅ /api/users/favorites: ${favoritesResponse.status}`);
    } catch (e) {
      console.log(`❌ /api/users/favorites: Error - ${e.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error inspecting backend:', error.message);
  }
}

// Run the inspection
inspectBackendData(); 