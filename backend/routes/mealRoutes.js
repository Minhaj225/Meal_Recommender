const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const Student = require("../models/Student");
const axios = require("axios");

const ML_API_URL = process.env.ML_API_URL || "http://localhost:5000";

// Create a meal entry
router.post("/", async (req, res) => {
  try {
    const meal = new Meal(req.body);
    await meal.save();
    
    res.json({
      success: true,
      message: "Meal created successfully",
      meal
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation error", 
        details: err.message 
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get all meals with filtering
router.get("/", async (req, res) => {
  try {
    const { cuisine, category, dietaryPreference, minCalories, maxCalories, minProtein } = req.query;
    
    let filter = { isActive: true };
    
    if (cuisine) filter.cuisine = cuisine;
    if (category) filter.category = category;
    if (dietaryPreference) filter.dietaryPreference = dietaryPreference;
    if (minCalories) filter.calories = { ...filter.calories, $gte: parseInt(minCalories) };
    if (maxCalories) filter.calories = { ...filter.calories, $lte: parseInt(maxCalories) };
    if (minProtein) filter.protein = { $gte: parseInt(minProtein) };

    const meals = await Meal.find(filter).sort({ popularity: -1, averageRating: -1 });
    
    res.json({
      success: true,
      count: meals.length,
      meals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get meal by ID
router.get("/:id", async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }
    
    res.json({
      success: true,
      meal
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recommend meals for a student using enhanced ML API
router.get("/recommend/:email", async (req, res) => {
  try {
    const { limit = 10, mealType } = req.query;
    
    // Get student profile
    const student = await Student.findOne({ email: req.params.email });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get meals based on student preferences
    let mealFilter = { isActive: true };
    
    // Filter by meal type if specified
    if (mealType) {
      mealFilter.category = mealType;
    }
    
    // Filter by dietary preference
    if (student.preferences?.dietaryPreference) {
      mealFilter.dietaryPreference = student.preferences.dietaryPreference;
    }
    
    // Filter by preferred cuisines
    if (student.preferences?.cuisines && student.preferences.cuisines.length > 0) {
      mealFilter.cuisine = { $in: student.preferences.cuisines };
    }
    
    // Filter by calorie goals
    if (student.nutritionGoals?.maxCaloriesPerMeal) {
      mealFilter.calories = { $lte: student.nutritionGoals.maxCaloriesPerMeal };
    }
    
    // Filter by protein goals
    if (student.nutritionGoals?.minProteinPerMeal) {
      mealFilter.protein = { $gte: student.nutritionGoals.minProteinPerMeal };
    }

    const meals = await Meal.find(mealFilter);
    
    if (meals.length === 0) {
      return res.json({
        success: true,
        message: "No meals found matching your preferences",
        recommendations: []
      });
    }

    // Prepare meals for ML prediction
    const mealPredictions = meals.map(meal => ({
      meal_name: meal.mealName,
      calories: meal.calories,
      protein: meal.protein,
      cuisine: meal.cuisine,
      category: meal.category,
      diet: meal.dietaryPreference
    }));

    // Get recommendations from ML API
    let recommendations = [];
    try {
      const mlResponse = await axios.post(`${ML_API_URL}/predict_batch`, {
        meals: mealPredictions
      }, {
        timeout: 10000
      });

      if (mlResponse.data.success !== false && mlResponse.data.results) {
        // Filter recommended meals
        const recommendedMeals = [];
        
        mlResponse.data.results.forEach((result, index) => {
          if (result.recommended && result.confidence > 0.5) {
            recommendedMeals.push({
              ...meals[index].toObject(),
              confidence: result.confidence,
              mlRecommended: true
            });
          }
        });

        // Sort by confidence and rating
        recommendations = recommendedMeals
          .sort((a, b) => (b.confidence * 0.7 + b.averageRating * 0.3) - (a.confidence * 0.7 + a.averageRating * 0.3))
          .slice(0, parseInt(limit));
      }
    } catch (mlError) {
      console.error("ML API Error:", mlError.message);
      // Fallback: return meals sorted by rating and popularity
      recommendations = meals
        .sort((a, b) => (b.averageRating * 0.6 + b.popularity * 0.4) - (a.averageRating * 0.6 + a.popularity * 0.4))
        .slice(0, parseInt(limit))
        .map(meal => ({
          ...meal.toObject(),
          confidence: 0.5,
          mlRecommended: false,
          fallbackRecommendation: true
        }));
    }

    res.json({
      success: true,
      recommendations,
      studentPreferences: student.preferences,
      totalMealsEvaluated: meals.length,
      mlApiUsed: recommendations.length > 0 ? recommendations[0].mlRecommended : false
    });

  } catch (err) {
    console.error("Recommendation Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Rate a meal
router.post("/:id/rate", async (req, res) => {
  try {
    const { rating, email } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    // Update meal rating
    const newTotalRatings = meal.totalRatings + 1;
    const newAverageRating = (meal.averageRating * meal.totalRatings + rating) / newTotalRatings;
    
    meal.averageRating = parseFloat(newAverageRating.toFixed(2));
    meal.totalRatings = newTotalRatings;
    meal.popularity += 1;
    
    await meal.save();

    // Update student meal history
    if (email) {
      const student = await Student.findOne({ email });
      if (student) {
        await student.updateOne({
          $push: {
            mealHistory: {
              mealId: meal._id,
              liked: rating >= 3,
              consumedAt: new Date()
            }
          }
        });
      }
    }

    res.json({
      success: true,
      message: "Rating recorded successfully",
      newAverageRating: meal.averageRating,
      totalRatings: meal.totalRatings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update meal
router.put("/:id", async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }
    
    res.json({
      success: true,
      message: "Meal updated successfully",
      meal
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation error", 
        details: err.message 
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete meal
router.delete("/:id", async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }
    
    res.json({
      success: true,
      message: "Meal deactivated successfully"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk import meals from CSV data
router.post("/bulk-import", async (req, res) => {
  try {
    const { meals } = req.body;
    
    if (!Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({ error: "Meals array is required" });
    }

    const importedMeals = await Meal.insertMany(meals, { ordered: false });
    
    res.json({
      success: true,
      message: `${importedMeals.length} meals imported successfully`,
      importedCount: importedMeals.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;