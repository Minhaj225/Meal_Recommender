const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  mealName: { type: String, required: true },
  cuisine: { 
    type: String, 
    required: true,
    enum: ["North Indian", "South Indian", "Street Food", "General"]
  },
  category: { 
    type: String, 
    required: true,
    enum: ["Main Dish", "Breakfast", "Snack", "Side Dish", "Staple"]
  },
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbohydrates: { type: Number, min: 0 },
  fats: { type: Number, min: 0 },
  dietaryPreference: { 
    type: String, 
    required: true,
    enum: ["Vegetarian", "Non-Vegetarian"]
  },
  servingSize: String,
  allergens: [String],
  ingredients: [String],
  description: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  nutritionScore: { type: Number, min: 0, max: 10 },
  popularity: { type: Number, default: 0 },
  averageRating: { type: Number, min: 0, max: 5, default: 0 },
  totalRatings: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Index for better query performance
mealSchema.index({ cuisine: 1, category: 1, dietaryPreference: 1 });
mealSchema.index({ calories: 1, protein: 1 });

module.exports = mongoose.model("Meal", mealSchema);