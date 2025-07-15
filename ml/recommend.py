import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle

# Load the dataset
raw_data = pd.read_csv("indian_food_nutrition_dataset.csv")

# Filter and rename relevant columns to match available data
data = raw_data[['Food Name', 'Category', 'Calories (kcal)', 'Protein (g)', 'Dietary Preference']].dropna()
data.columns = ['meal_name', 'category', 'calories', 'protein', 'diet']

# Create a simple cuisine mapping based on food names
def assign_cuisine(food_name):
    if any(word in food_name.lower() for word in ['idli', 'dosa', 'sambar', 'rasam']):
        return 'South Indian'
    elif any(word in food_name.lower() for word in ['roti', 'dal', 'chole', 'butter']):
        return 'North Indian'
    elif any(word in food_name.lower() for word in ['pani puri', 'samosa']):
        return 'Street Food'
    else:
        return 'General'

data['cuisine'] = data['meal_name'].apply(assign_cuisine)

# Encode categorical features using one-hot encoding
data = pd.get_dummies(data, columns=['cuisine', 'category', 'diet'])

# Simulate student preferences and feedback more efficiently
students = []
np.random.seed(42)
cuisine_columns = [col for col in data.columns if col.startswith("cuisine_")]
category_columns = [col for col in data.columns if col.startswith("category_")]
diet_columns = [col for col in data.columns if col.startswith("diet_")]

# Generate training data: for each meal, simulate multiple student interactions
for _, meal in data.iterrows():
    # Generate 10-15 student interactions per meal for better training data
    for _ in range(np.random.randint(10, 16)):
        # Simulate preference-based liking probability
        base_prob = 0.4  # Base probability of liking a meal
        
        # Increase probability based on preferences
        if meal['calories'] < 200:  # Lower calorie preference
            base_prob += 0.2
        if meal['protein'] > 10:  # Higher protein preference
            base_prob += 0.1
            
        # Dietary preference matching
        if any(meal[col] == 1 for col in diet_columns if 'vegetarian' in col.lower()):
            base_prob += 0.15  # Vegetarian preference boost
            
        # Cap probability at 0.9
        like_prob = min(base_prob, 0.9)
        liked = np.random.binomial(1, like_prob)

        student_record = {
            'calories': meal['calories'],
            'protein': meal['protein'],
            **{col: meal[col] for col in cuisine_columns},
            **{col: meal[col] for col in category_columns},
            **{col: meal[col] for col in diet_columns},
            'likes': liked
        }
        students.append(student_record)

# Create DataFrame from simulated student data
df = pd.DataFrame(students)
features = [col for col in df.columns if col != 'likes']
X = df[features]
y = df['likes']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = RandomForestClassifier(n_estimators=150, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
accuracy = accuracy_score(y_test, model.predict(X_test))
print(f"Model Accuracy: {accuracy:.3f}")
print(f"Training samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")
print(f"Feature count: {len(X.columns)}")

# Save the trained model and feature columns for later use
model_data = {
    'model': model,
    'features': list(X.columns),
    'accuracy': accuracy
}

with open("model.pkl", "wb") as f:
    pickle.dump(model_data, f)

print("Model saved successfully!")

# Optional: Show feature importance
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\nTop 5 Most Important Features:")
print(feature_importance.head())