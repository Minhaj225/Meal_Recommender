const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Import models
const Meal = require("../models/Meal");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Cuisine mapping function (same as in ML script)
function assignCuisine(foodName) {
  const name = foodName.toLowerCase();
  if (['idli', 'dosa', 'sambar', 'rasam', 'vada', 'uttapam'].some(word => name.includes(word))) {
    return 'South Indian';
  } else if (['roti', 'dal', 'chole', 'butter', 'tandoori', 'paratha', 'palak'].some(word => name.includes(word))) {
    return 'North Indian';
  } else if (['pani puri', 'samosa', 'dhokla'].some(word => name.includes(word))) {
    return 'Street Food';
  } else {
    return 'General';
  }
}

// Category mapping function
function assignCategory(foodName, originalCategory) {
  const name = foodName.toLowerCase();
  const category = originalCategory.toLowerCase();
  
  if (category.includes('breakfast') || ['idli', 'dosa', 'upma', 'poha', 'paratha'].some(word => name.includes(word))) {
    return 'Breakfast';
  } else if (category.includes('snack') || ['samosa', 'vada', 'dhokla', 'pani puri'].some(word => name.includes(word))) {
    return 'Snack';
  } else if (category.includes('side') || ['sambar', 'rasam'].some(word => name.includes(word))) {
    return 'Side Dish';
  } else if (category.includes('staple') || ['roti', 'rice'].some(word => name.includes(word))) {
    return 'Staple';
  } else {
    return 'Main Dish';
  }
}

async function seedMeals() {
  try {
    console.log("🌱 Starting meal seeding process...");
    
    // Read the CSV file from ML directory
    const csvPath = path.join(__dirname, "../../ml/indian_food_nutrition_dataset.csv");
    
    if (!fs.existsSync(csvPath)) {
      throw new Error("CSV file not found. Please ensure the ML dataset exists.");
    }
    
    const csvData = fs.readFileSync(csvPath, "utf8");
    const lines = csvData.split("\n");
    const headers = lines[0].split(",");
    
    // Clear existing meals
    await Meal.deleteMany({});
    console.log("🗑️  Cleared existing meals");
    
    const meals = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(",");
      
      try {
        const foodName = values[0]?.replace(/"/g, "") || "";
        const category = values[1]?.replace(/"/g, "") || "";
        const calories = parseFloat(values[3]?.replace(/"/g, "")) || 0;
        const protein = parseFloat(values[4]?.replace(/"/g, "")) || 0;
        const carbs = parseFloat(values[5]?.replace(/"/g, "")) || 0;
        const fats = parseFloat(values[6]?.replace(/"/g, "")) || 0;
        const dietPref = values[7]?.replace(/"/g, "") || "Vegetarian";
        
        if (!foodName || calories <= 0) continue;
        
        const meal = {
          mealName: foodName,
          cuisine: assignCuisine(foodName),
          category: assignCategory(foodName, category),
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbohydrates: Math.round(carbs * 10) / 10,
          fats: Math.round(fats * 10) / 10,
          dietaryPreference: dietPref.includes("Non") ? "Non-Vegetarian" : "Vegetarian",
          servingSize: "1 serving",
          description: `Traditional Indian ${assignCuisine(foodName)} dish`,
          isActive: true,
          nutritionScore: Math.min(10, Math.max(1, Math.round((protein / calories * 100) * 2))),
          popularity: Math.floor(Math.random() * 50) + 1,
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
          totalRatings: Math.floor(Math.random() * 100) + 10
        };
        
        meals.push(meal);
        
      } catch (parseError) {
        console.warn(`⚠️  Skipping invalid row ${i}: ${parseError.message}`);
        continue;
      }
    }
    
    // Insert meals in batches
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < meals.length; i += batchSize) {
      const batch = meals.slice(i, i + batchSize);
      try {
        await Meal.insertMany(batch, { ordered: false });
        insertedCount += batch.length;
        console.log(`📦 Inserted batch ${Math.ceil((i + batchSize) / batchSize)}: ${batch.length} meals`);
      } catch (batchError) {
        console.warn(`⚠️  Batch ${Math.ceil((i + batchSize) / batchSize)} had some errors, continuing...`);
        insertedCount += batch.length;
      }
    }
    
    console.log(`✅ Successfully seeded ${insertedCount} meals to the database`);
    
    // Display summary statistics
    const cuisineStats = await Meal.aggregate([
      { $group: { _id: "$cuisine", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const categoryStats = await Meal.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const dietStats = await Meal.aggregate([
      { $group: { _id: "$dietaryPreference", count: { $sum: 1 } } }
    ]);
    
    console.log("\n📊 Seeding Summary:");
    console.log("Cuisine Distribution:", cuisineStats);
    console.log("Category Distribution:", categoryStats);
    console.log("Diet Distribution:", dietStats);
    
  } catch (error) {
    console.error("❌ Error seeding meals:", error.message);
  } finally {
    mongoose.connection.close();
    console.log("🔐 Database connection closed");
  }
}

// Run the seeder
if (require.main === module) {
  seedMeals();
}

module.exports = seedMeals;
