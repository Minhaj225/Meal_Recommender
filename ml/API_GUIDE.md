# 🤖 AI Meal Recommendation API Guide

## 🌐 Live API Deployment
- **Production URL**: [https://mealrecommender-production.up.railway.app](https://mealrecommender-production.up.railway.app)
- **Local Development**: `http://localhost:5000`
- **Platform**: Railway (with automatic scaling and health monitoring)

## 📋 Overview
The Enhanced Flask ML API provides intelligent meal recommendations using a Random Forest Classifier trained on Indian food nutrition data. The API features:

- **🧠 Machine Learning**: Random Forest model with real-time predictions
- **📊 Dynamic Features**: One-hot encoded categorical variables with numerical features
- **⚡ Real-time Processing**: Sub-500ms prediction response times
- **🔄 Batch Processing**: Multiple meal predictions in a single request
- **🛡️ Error Handling**: Comprehensive validation and error responses
- **📈 Model Metadata**: Accuracy metrics and feature importance tracking
- **🔍 Health Monitoring**: Production-ready health checks and status endpoints

## 🎯 Model Capabilities

### Training Data
- **Dataset**: `indian_food_nutrition_dataset.csv` (comprehensive Indian cuisine nutrition data)
- **Algorithm**: Random Forest Classifier with 100 estimators
- **Target**: High-protein meal recommendations (above median protein content)
- **Accuracy**: ~75-85% on test data (varies with dataset quality)

### Supported Features
- **📊 Numerical Features**: 
  - `calories` (0-1000+ kcal range)
  - `protein` (0-50+ grams range)
  
- **🏷️ Categorical Features** (One-hot encoded):
  - **Cuisine**: North Indian, South Indian, Street Food, General
  - **Category**: Main Dish, Breakfast, Snack, Side Dish, Staple  
  - **Diet**: Vegetarian, Non-Vegetarian

- **🔢 Model Metadata**:
  - Feature count (typically 13-15 features after encoding)
  - Model accuracy percentage
  - Feature importance rankings

## 🛠️ API Endpoints

### 1. `GET /` - API Information & Status
**Description**: Returns comprehensive API status, model information, and available endpoints.

**Response Example**:
```json
{
  "message": "Enhanced Meal Recommendation ML API is running.",
  "model_accuracy": "0.789",
  "feature_count": 13,
  "model_loaded": true,
  "endpoints": {
    "/predict": "POST - Get meal recommendation",
    "/predict_batch": "POST - Get recommendations for multiple meals", 
    "/features": "GET - Get model feature information",
    "/health": "GET - Health check"
  }
}
```

### 2. `GET /features` - Model Feature Information
**Description**: Returns detailed information about the trained model's features and performance.

**Response Example**:
```json
{
  "features": [
    "calories", "protein", "cuisine_North Indian", "cuisine_South Indian",
    "category_Main Dish", "category_Breakfast", "diet_Vegetarian"
  ],
  "feature_count": 13,
  "model_accuracy": 0.789
}
```

### 3. `POST /predict` - Single Meal Prediction
**Description**: Get AI recommendation for a single meal with confidence scoring.

**Request Format**:
```json
{
  "meal_name": "Dal Tadka",
  "calories": 180,
  "protein": 9,
  "cuisine": "North Indian",
  "category": "Main Dish",
  "diet": "Vegetarian"
}
```

**Response Format**:
```json
{
  "meal_name": "Dal Tadka",
  "recommended": true,
  "confidence": 0.85,
  "features_used": 13
}
```

**Required Fields**: `calories`, `protein`, `cuisine`, `category`, `diet`  
**Optional Fields**: `meal_name` (defaults to "Unknown")

### 4. `POST /predict_batch` - Batch Meal Predictions
**Description**: Process multiple meals efficiently in a single request for bulk recommendations.

**Request Format**:
```json
{
  "meals": [
    {
      "meal_name": "Dal Tadka",
      "calories": 180,
      "protein": 9,
      "cuisine": "North Indian", 
      "category": "Main Dish",
      "diet": "Vegetarian"
    },
    {
      "meal_name": "Butter Chicken",
      "calories": 350,
      "protein": 28,
      "cuisine": "North Indian",
      "category": "Main Dish", 
      "diet": "Non-Vegetarian"
    }
  ]
}
```

**Response Format**:
```json
{
  "results": [
    {
      "meal_name": "Dal Tadka",
      "recommended": true,
      "confidence": 0.85
    },
    {
      "meal_name": "Butter Chicken", 
      "recommended": true,
      "confidence": 0.92
    }
  ],
  "total_meals": 2,
  "successful_predictions": 2
}
```

### 5. `GET /health` - Health Check & Monitoring
**Description**: Production health check endpoint for monitoring and load balancer integration.

**Response Format**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "feature_count": 13,
  "model_accuracy": 0.789,
  "timestamp": "2025-07-14T10:30:00.123456"
}
```

## 📝 Supported Values & Validation

### 🍛 Cuisine Types
- **North Indian**: Dal, Curry, Roti, Naan-based dishes
- **South Indian**: Rice, Dosa, Idli, Sambar-based dishes  
- **Street Food**: Chaat, Vada Pav, Pani Puri, etc.
- **General**: Pan-Indian or fusion dishes

### 🍽️ Category Types
- **Main Dish**: Primary meals (lunch/dinner items)
- **Breakfast**: Morning meal items
- **Snack**: Light eating items between meals
- **Side Dish**: Accompaniments to main dishes
- **Staple**: Basic food items (rice, bread, etc.)

### 🥬 Diet Types
- **Vegetarian**: Plant-based ingredients only
- **Non-Vegetarian**: Includes meat, fish, or poultry

### 📊 Numerical Ranges
- **Calories**: 0-1000+ kcal (typical range: 100-800)
- **Protein**: 0-50+ grams (typical range: 2-40)

## 🚀 Integration Examples

### 1. **Python Integration**
```python
import requests

# Single prediction
response = requests.post('https://mealrecommender-production.up.railway.app/predict', 
  json={
    "meal_name": "Paneer Butter Masala",
    "calories": 320,
    "protein": 15,
    "cuisine": "North Indian",
    "category": "Main Dish",
    "diet": "Vegetarian"
  }
)
result = response.json()
print(f"Recommended: {result['recommended']}, Confidence: {result['confidence']}")
```

### 2. **JavaScript/React Integration**
```javascript
// Using axios (as implemented in the frontend)
import axios from 'axios';

const predictMeal = async (mealData) => {
  try {
    const response = await axios.post(
      'https://mealrecommender-production.up.railway.app/predict',
      mealData
    );
    return response.data;
  } catch (error) {
    console.error('Prediction failed:', error);
    throw error;
  }
};

// Usage
const recommendation = await predictMeal({
  meal_name: "Biryani",
  calories: 450,
  protein: 20,
  cuisine: "North Indian", 
  category: "Main Dish",
  diet: "Non-Vegetarian"
});
```

### 3. **Backend Integration (Node.js)**
```javascript
// As implemented in backend/routes/mealRoutes.js
const axios = require('axios');

const getMLRecommendations = async (meals) => {
  try {
    const mlResponse = await axios.post(`${ML_API_URL}/predict_batch`, {
      meals: meals.map(meal => ({
        meal_name: meal.mealName,
        calories: meal.calories,
        protein: meal.protein,
        cuisine: meal.cuisine,
        category: meal.category,
        diet: meal.dietaryPreference
      }))
    }, { timeout: 10000 });
    
    return mlResponse.data.results;
  } catch (error) {
    console.error('ML API Error:', error);
    return [];
  }
};
```

## 🧪 Testing & Development

### **Local Development Setup**
```bash
# 1. Install dependencies
cd ml
pip install -r requirements.txt

# 2. Generate model (if not exists)
python create_model.py

# 3. Start API server
python api.py
# Server runs on http://localhost:5000
```

### **Automated Testing**
```bash
# Run comprehensive API tests
python test_api.py

# Expected output includes:
# ✅ API Info test
# ✅ Features endpoint test  
# ✅ Single prediction test
# ✅ Batch prediction test
# ✅ Health check test
```

### **Manual Testing with cURL**
```bash
# Health check
curl https://mealrecommender-production.up.railway.app/health

# Single prediction
curl -X POST https://mealrecommender-production.up.railway.app/predict \
  -H "Content-Type: application/json" \
  -d '{
    "meal_name": "Masala Dosa", 
    "calories": 280,
    "protein": 8,
    "cuisine": "South Indian",
    "category": "Breakfast", 
    "diet": "Vegetarian"
  }'

# Get model features
curl https://mealrecommender-production.up.railway.app/features
```

## 🏗️ Architecture & Deployment

### **Production Environment**
- **Platform**: Railway with Nixpacks buildpack
- **Runtime**: Python 3.9+ with gunicorn WSGI server
- **Scaling**: Automatic scaling based on CPU/memory usage  
- **Health Checks**: `/health` endpoint with 300s timeout
- **Restart Policy**: Automatic restart on failure (max 3 retries)

### **Model Persistence**
- **Storage**: `model.pkl` file with joblib serialization
- **Loading**: Automatic model loading on startup
- **Fallback**: Dummy model creation if real model fails
- **Training**: Automatic retraining from dataset if model missing

### **Performance Metrics**
- **Response Time**: ~200-500ms per prediction
- **Batch Processing**: ~100-200ms per meal in batch  
- **Uptime**: 99.9% availability on Railway
- **Memory Usage**: ~512MB baseline, scales with batch size

## 🔧 Error Handling & Troubleshooting

### **Common Error Responses**
```json
// Missing required field
{
  "error": "Missing required field: calories"
}

// Model not loaded
{
  "message": "API is running but model may not be loaded",
  "error": "Model initialization failed"
}

// Invalid data format
{
  "error": "Invalid JSON format",
  "trace": "..."
}
```

### **Troubleshooting Steps**
1. **API Not Responding**: Check Railway service status
2. **Prediction Errors**: Validate input data format and required fields
3. **Low Confidence**: Review meal nutrition values against training data
4. **Batch Failures**: Reduce batch size or check individual meal data

## 📚 Related Documentation
- **Main README**: [Project Overview](../README.md)
- **Backend API**: [Backend Routes](../backend/README.md)  
- **Frontend Integration**: [React Service Layer](../react-frontend/src/services/api.js)
- **Dataset Info**: [Training Data](./indian_food_nutrition_dataset.csv)

## 📞 Support & Monitoring
- **Health Monitoring**: `/health` endpoint for uptime monitoring
- **Error Tracking**: Detailed error responses with stack traces
- **Performance**: Railway metrics dashboard for resource monitoring
- **Logs**: Real-time logs available in Railway dashboard

---

🤖 **Built with Flask, scikit-learn, and deployed on Railway for reliable ML predictions**
