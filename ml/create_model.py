#!/usr/bin/env python3
"""
Simple script to generate a basic ML model for deployment
Run this during the build process if model.pkl doesn't exist
"""

import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

def create_simple_model():
    """Create a simple model for meal recommendations"""
    
    # Create synthetic training data based on common meal patterns
    np.random.seed(42)
    
    # Features: calories, protein, cuisine_*, category_*, diet_*
    feature_names = [
        'calories', 'protein',
        'cuisine_North Indian', 'cuisine_South Indian', 'cuisine_Street Food', 'cuisine_General',
        'category_Main Dish', 'category_Breakfast', 'category_Snack', 'category_Side Dish', 'category_Staple',
        'diet_Vegetarian', 'diet_Non-Vegetarian'
    ]
    
    # Generate realistic meal data
    n_samples = 500
    X = np.zeros((n_samples, len(feature_names)))
    
    for i in range(n_samples):
        # Calories (100-800)
        X[i, 0] = np.random.normal(300, 150)
        # Protein (5-50g)
        X[i, 1] = np.random.normal(15, 10)
        
        # One-hot encode cuisines (only one can be 1)
        cuisine_idx = np.random.choice(range(2, 6))
        X[i, cuisine_idx] = 1
        
        # One-hot encode categories (only one can be 1)
        category_idx = np.random.choice(range(6, 11))
        X[i, category_idx] = 1
        
        # One-hot encode diet (only one can be 1)
        diet_idx = np.random.choice(range(11, 13))
        X[i, diet_idx] = 1
    
    # Create target: recommend meals with good protein/calorie ratio
    protein_cal_ratio = X[:, 1] / (X[:, 0] + 1)  # +1 to avoid division by zero
    y = (protein_cal_ratio > np.median(protein_cal_ratio)).astype(int)
    
    # Train model
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    
    # Save model
    model_data = {
        'model': model,
        'features': feature_names,
        'accuracy': accuracy
    }
    
    with open('model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"✅ Model created and saved with accuracy: {accuracy:.3f}")
    print(f"📊 Features: {len(feature_names)}")
    
    return model_data

if __name__ == "__main__":
    create_simple_model()
