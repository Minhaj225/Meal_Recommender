"""
Test script for the enhanced Meal Recommendation API
Run this after starting the Flask API server
"""
import requests
import json

API_BASE_URL = "http://localhost:5000"

def test_api():
    print("🧪 Testing Enhanced Meal Recommendation API")
    print("=" * 50)
    
    # Test 1: API Info
    print("\n1. Testing API Info...")
    response = requests.get(f"{API_BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test 2: Get Features
    print("\n2. Testing Features Endpoint...")
    response = requests.get(f"{API_BASE_URL}/features")
    print(f"Status: {response.status_code}")
    features_data = response.json()
    print(f"Feature count: {features_data['feature_count']}")
    print(f"Model accuracy: {features_data['model_accuracy']}")
    
    # Test 3: Single Prediction
    print("\n3. Testing Single Meal Prediction...")
    meal_data = {
        "meal_name": "Dal Tadka",
        "calories": 180,
        "protein": 9,
        "cuisine": "North Indian",
        "category": "Main Dish",
        "diet": "Vegetarian"
    }
    
    response = requests.post(f"{API_BASE_URL}/predict", json=meal_data)
    print(f"Status: {response.status_code}")
    print(f"Prediction: {json.dumps(response.json(), indent=2)}")
    
    # Test 4: Batch Prediction
    print("\n4. Testing Batch Predictions...")
    batch_data = {
        "meals": [
            {
                "meal_name": "Butter Chicken",
                "calories": 350,
                "protein": 28,
                "cuisine": "North Indian",
                "category": "Main Dish",
                "diet": "Non-Vegetarian"
            },
            {
                "meal_name": "Idli",
                "calories": 140,
                "protein": 4,
                "cuisine": "South Indian",
                "category": "Breakfast",
                "diet": "Vegetarian"
            },
            {
                "meal_name": "Samosa",
                "calories": 260,
                "protein": 4,
                "cuisine": "Street Food",
                "category": "Snack",
                "diet": "Vegetarian"
            }
        ]
    }
    
    response = requests.post(f"{API_BASE_URL}/predict_batch", json=batch_data)
    print(f"Status: {response.status_code}")
    print(f"Batch Results: {json.dumps(response.json(), indent=2)}")
    
    # Test 5: Health Check
    print("\n5. Testing Health Check...")
    response = requests.get(f"{API_BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Health: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the Flask server is running on port 5000")
        print("Run: python api.py")
    except Exception as e:
        print(f"❌ Error: {e}")
