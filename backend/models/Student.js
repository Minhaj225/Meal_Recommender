const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  preferences: {
    cuisines: [{ type: String, enum: ["North Indian", "South Indian", "Street Food", "General"] }],
    dietaryPreference: { type: String, enum: ["Vegetarian", "Non-Vegetarian"], default: "Vegetarian" },
    categories: [{ type: String, enum: ["Main Dish", "Breakfast", "Snack", "Side Dish", "Staple"] }]
  },
  allergies: [String],
  nutritionGoals: {
    caloriesPerDay: { type: Number, min: 1000, max: 5000 },
    proteinGramsPerDay: { type: Number, min: 20, max: 200 },
    maxCaloriesPerMeal: { type: Number, min: 100, max: 1000 },
    minProteinPerMeal: { type: Number, min: 5, max: 50 }
  },
  activityLevel: { type: String, enum: ["Low", "Moderate", "High"], default: "Moderate" },
  mealHistory: [{
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
    liked: Boolean,
    consumedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("Student", studentSchema);