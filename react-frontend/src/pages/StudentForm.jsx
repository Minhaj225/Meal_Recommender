import React, { useState, useEffect } from "react";
import { studentAPI, apiUtils } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const StudentForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    preferences: {
      cuisines: [],
      dietaryPreference: "Vegetarian",
      categories: []
    },
    allergies: [],
    nutritionGoals: {
      caloriesPerDay: 2000,
      proteinGramsPerDay: 80,
      maxCaloriesPerMeal: 500,
      minProteinPerMeal: 15
    },
    activityLevel: "Moderate"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingProfile, setExistingProfile] = useState(null);

  const cuisineOptions = ["North Indian", "South Indian", "Street Food", "General"];
  const categoryOptions = ["Main Dish", "Breakfast", "Snack", "Side Dish", "Staple"];
  const activityLevels = ["Low", "Moderate", "High"];

  // Load existing profile if email is provided
  useEffect(() => {
    const loadProfile = async () => {
      const email = new URLSearchParams(window.location.search).get('email');
      if (email) {
        try {
          const response = await studentAPI.getProfile(email);
          if (response.success && response.student) {
            setForm(response.student);
            setExistingProfile(response.student);
          }
        } catch (error) {
          console.log("No existing profile found");
        }
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, value, isChecked) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: isChecked 
            ? [...prev[parent][child], value]
            : prev[parent][child].filter(item => item !== value)
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [field]: isChecked 
          ? [...prev[field], value]
          : prev[field].filter(item => item !== value)
      }));
    }
  };

  const handleAllergiesChange = (e) => {
    const allergies = e.target.value.split(',').map(s => s.trim()).filter(s => s);
    setForm(prev => ({ ...prev, allergies }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!form.name || !form.email) {
      setError("Name and email are required");
      setLoading(false);
      return;
    }

    if (!apiUtils.validateEmail(form.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await studentAPI.createOrUpdateProfile(form);
      setSuccess(response.message || "Profile saved successfully!");
      setExistingProfile(response.student);
      
      // Update URL with email for future loads
      const url = new URL(window.location);
      url.searchParams.set('email', form.email);
      window.history.replaceState(null, '', url);
      
    } catch (error) {
      setError(apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !existingProfile) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-6 text-center">
              {existingProfile ? "Update Your Profile" : "Create Your Profile"}
            </h2>

            {error && <ErrorMessage message={error} />}
            {success && (
              <div className="alert alert-success">
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold mr-3">Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold mr-3">Email *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Cuisine Preferences */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold my-3">Cuisine Preferences</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {cuisineOptions.map(cuisine => (
                    <label key={cuisine} className="label cursor-pointer">
                      <span className="label-text">{cuisine}</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={form.preferences.cuisines.includes(cuisine)}
                        onChange={(e) => handleArrayChange('preferences.cuisines', cuisine, e.target.checked)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Preference */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold my-3">Dietary Preference</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer">
                    <input
                      type="radio"
                      name="preferences.dietaryPreference"
                      value="Vegetarian"
                      checked={form.preferences.dietaryPreference === "Vegetarian"}
                      onChange={handleChange}
                      className="radio radio-primary"
                    />
                    <span className="label-text mx-2">Vegetarian</span>
                  </label>
                  <label className="label cursor-pointer">
                    <input
                      type="radio"
                      name="preferences.dietaryPreference"
                      value="Non-Vegetarian"
                      checked={form.preferences.dietaryPreference === "Non-Vegetarian"}
                      onChange={handleChange}
                      className="radio radio-primary"
                    />
                    <span className="label-text ml-2">Non-Vegetarian</span>
                  </label>
                </div>
              </div>

              {/* Meal Categories */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold my-3">Preferred Meal Types</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {categoryOptions.map(category => (
                    <label key={category} className="label cursor-pointer">
                      <span className="label-text text-sm">{category}</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={form.preferences.categories.includes(category)}
                        onChange={(e) => handleArrayChange('preferences.categories', category, e.target.checked)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Activity Level */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold my-3 mr-3">Activity Level</span>
                </label>
                <select
                  name="activityLevel"
                  value={form.activityLevel}
                  onChange={handleChange}
                  className="select select-bordered"
                >
                  {activityLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Nutrition Goals */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">Nutrition Goals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Daily Calories</span>
                      </label>
                      <input
                        type="number"
                        name="nutritionGoals.caloriesPerDay"
                        value={form.nutritionGoals.caloriesPerDay}
                        onChange={handleChange}
                        className="input input-bordered"
                        min="1000"
                        max="5000"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Daily Protein (g)</span>
                      </label>
                      <input
                        type="number"
                        name="nutritionGoals.proteinGramsPerDay"
                        value={form.nutritionGoals.proteinGramsPerDay}
                        onChange={handleChange}
                        className="input input-bordered"
                        min="20"
                        max="200"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Max Calories per Meal</span>
                      </label>
                      <input
                        type="number"
                        name="nutritionGoals.maxCaloriesPerMeal"
                        value={form.nutritionGoals.maxCaloriesPerMeal}
                        onChange={handleChange}
                        className="input input-bordered"
                        min="100"
                        max="1000"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Min Protein per Meal (g)</span>
                      </label>
                      <input
                        type="number"
                        name="nutritionGoals.minProteinPerMeal"
                        value={form.nutritionGoals.minProteinPerMeal}
                        onChange={handleChange}
                        className="input input-bordered"
                        min="5"
                        max="50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold mr-3">Allergies</span>
                </label>
                <input
                  type="text"
                  value={form.allergies.join(', ')}
                  onChange={handleAllergiesChange}
                  className="input input-bordered w-100"
                  placeholder="Enter allergies separated by commas (e.g., nuts, dairy, soy)"
                />
              </div>

              {/* Submit Button */}
              <div className="card-actions justify-center pt-6">
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
