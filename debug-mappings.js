// Simple debug script to check backend data
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugBackendData() {
  try {
    console.log('🔍 Fetching backend data...\n');
    
    // Fetch meals
    const mealsResponse = await fetch('https://custom-dining.onrender.com/api/meals');
    const mealsData = await mealsResponse.json();
    
    console.log('🍽️ MEALS FROM BACKEND:');
    console.log(`📊 Total: ${mealsData.results} meals\n`);
    
    mealsData.data.forEach((meal, index) => {
      console.log(`${index + 1}. 📋 ${meal.name} (ID: ${meal.id})`);
      console.log(`   📝 Description: ${meal.description}`);
      console.log(`   💰 Price: ₦${meal.price}`);
      console.log(`   🏪 Restaurant: ${meal.restaurant?.name || 'Unknown'} (${meal.restaurantId})`);
      console.log(`   🏷️ Tags: ${meal.dietaryTags.join(', ')}`);
      console.log(`   ⚠️ Allergens: ${meal.allergens.join(', ')}`);
      console.log(`   📊 Nutrition: ${meal.nutritionalInfo.calories} cal, ${meal.nutritionalInfo.protein}g protein`);
      console.log(`   📸 Image needed: assets/meals/${meal.name.toLowerCase().replace(/\s+/g, '-')}.jpg`);
      console.log('');
    });
    
    // Fetch restaurants
    const restaurantsResponse = await fetch('https://custom-dining.onrender.com/api/restaurants');
    const restaurantsData = await restaurantsResponse.json();
    
    console.log('\n🏪 RESTAURANTS FROM BACKEND:');
    console.log(`📊 Total: ${restaurantsData.results} restaurants\n`);
    
    restaurantsData.data.restaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. 📋 ${restaurant.restaurantName} (ID: ${restaurant.restaurantId})`);
      console.log(`   📍 Location: ${restaurant.location}`);
      console.log(`   🍽️ Cuisine: ${restaurant.cuisineType}`);
      console.log(`   📧 Contact: ${restaurant.contactEmail}`);
      console.log(`   ✅ Status: ${restaurant.status} (Active: ${restaurant.isActive})`);
      console.log(`   👤 Owner: ${restaurant.owner.username} (${restaurant.owner.email})`);
      console.log(`   📸 Image needed: assets/restaurants/${restaurant.restaurantName.toLowerCase().replace(/\s+/g, '-')}.jpg`);
      console.log('');
    });
    
    console.log('\n🎯 SUMMARY:');
    console.log(`📦 You need ${mealsData.results} meal images`);
    console.log(`📦 You need ${restaurantsData.data.restaurants.length} restaurant images`);
    console.log('\n📁 Suggested file structure:');
    console.log('assets/');
    console.log('├── meals/');
    mealsData.data.forEach(meal => {
      const filename = meal.name.toLowerCase().replace(/\s+/g, '-') + '.jpg';
      console.log(`│   ├── ${filename}`);
    });
    console.log('├── restaurants/');
    restaurantsData.data.restaurants.forEach(restaurant => {
      const filename = restaurant.restaurantName.toLowerCase().replace(/\s+/g, '-') + '.jpg';
      console.log(`│   ├── ${filename}`);
    });
    console.log('└── ...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugBackendData(); 