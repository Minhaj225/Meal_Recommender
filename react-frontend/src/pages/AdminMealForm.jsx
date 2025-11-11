import React, { useState, useEffect } from "react";
import { mealAPI, mlAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const AdminMealForm = () => {
  const [form, setForm] = useState({
    mealName: "",
    cuisine: "North Indian",
    category: "Main Dish",
    calories: "",
    protein: "",
    carbohydrates: "",
    fats: "",
    dietaryPreference: "Vegetarian",
    servingSize: "",
    allergens: "",
    ingredients: "",
    description: "",
    imageUrl: "",
    nutritionScore: "",
  });

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mlFeatures, setMlFeatures] = useState([]);
  const [bulkImportFile, setBulkImportFile] = useState(null);

  const cuisineOptions = [
    "North Indian",
    "South Indian",
    "Street Food",
    "General",
  ];
  const categoryOptions = [
    "Main Dish",
    "Breakfast",
    "Snack",
    "Side Dish",
    "Staple",
  ];
  const dietOptions = ["Vegetarian", "Non-Vegetarian"];

  useEffect(() => {
    loadMeals();
    loadMLFeatures();
  }, []);

  const loadMeals = async () => {
    try {
      const response = await mealAPI.getMeals();
      setMeals(response.meals || []);
    } catch (err) {
      console.error("Error loading meals:", err);
    }
  };

  const loadMLFeatures = async () => {
    try {
      const response = await mlAPI.getFeatures();
      setMlFeatures(response.features || []);
    } catch (err) {
      console.error("Error loading ML features:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const mealData = {
        ...form,
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbohydrates: form.carbohydrates
          ? Number(form.carbohydrates)
          : undefined,
        fats: form.fats ? Number(form.fats) : undefined,
        nutritionScore: form.nutritionScore
          ? Number(form.nutritionScore)
          : undefined,
        allergens: form.allergens
          ? form.allergens
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a)
          : [],
        ingredients: form.ingredients
          ? form.ingredients
              .split(",")
              .map((i) => i.trim())
              .filter((i) => i)
          : [],
      };

      await mealAPI.createMeal(mealData);
      setSuccess("Meal added successfully!");

      // Reset form
      setForm({
        mealName: "",
        cuisine: "North Indian",
        category: "Main Dish",
        calories: "",
        protein: "",
        carbohydrates: "",
        fats: "",
        dietaryPreference: "Vegetarian",
        servingSize: "",
        allergens: "",
        ingredients: "",
        description: "",
        imageUrl: "",
        nutritionScore: "",
      });

      // Reload meals
      loadMeals();
    } catch (err) {
      setError("Failed to add meal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mealId) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    try {
      await mealAPI.deleteMeal(mealId);
      setSuccess("Meal deleted successfully!");
      loadMeals();
    } catch (err) {
      setError("Failed to delete meal: " + err.message);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkImportFile) {
      setError("Please select a CSV file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await bulkImportFile.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const meals = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const meal = {};
          headers.forEach((header, index) => {
            meal[header] = values[index];
          });
          return meal;
        });

      await mealAPI.bulkImportMeals(meals);
      setSuccess(`Successfully imported ${meals.length} meals!`);
      loadMeals();
      setBulkImportFile(null);
    } catch (err) {
      setError("Failed to import meals: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin: Meal Management</h1>
          <div className="badge badge-primary">{meals.length} Total Meals</div>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && (
          <div className="alert alert-success mb-6">
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Meal Form */}
          <div className="card bg-stone-700 shadow-lg">
            <div className="card-body ">
              <h2 className="card-title text-2xl mb-4">Add New Meal</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Meal Name *</span>
                    </label>
                    <input
                      name="mealName"
                      value={form.mealName}
                      onChange={handleChange}
                      placeholder="e.g., Dal Tadka"
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Cuisine *</span>
                    </label>
                    <select
                      name="cuisine"
                      value={form.cuisine}
                      onChange={handleChange}
                      className="select select-bordered"
                      required
                    >
                      {cuisineOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Category *</span>
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="select select-bordered"
                      required
                    >
                      {categoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Dietary Preference *</span>
                    </label>
                    <select
                      name="dietaryPreference"
                      value={form.dietaryPreference}
                      onChange={handleChange}
                      className="select select-bordered"
                      required
                    >
                      {dietOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Calories *</span>
                    </label>
                    <input
                      name="calories"
                      type="number"
                      value={form.calories}
                      onChange={handleChange}
                      placeholder="180"
                      className="input input-bordered"
                      required
                      min="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Protein (g) *</span>
                    </label>
                    <input
                      name="protein"
                      type="number"
                      step="0.1"
                      value={form.protein}
                      onChange={handleChange}
                      placeholder="9.5"
                      className="input input-bordered"
                      required
                      min="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Carbohydrates (g)</span>
                    </label>
                    <input
                      name="carbohydrates"
                      type="number"
                      step="0.1"
                      value={form.carbohydrates}
                      onChange={handleChange}
                      placeholder="25.0"
                      className="input input-bordered"
                      min="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Fats (g)</span>
                    </label>
                    <input
                      name="fats"
                      type="number"
                      step="0.1"
                      value={form.fats}
                      onChange={handleChange}
                      placeholder="5.2"
                      className="input input-bordered"
                      min="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Serving Size</span>
                    </label>
                    <input
                      name="servingSize"
                      value={form.servingSize}
                      onChange={handleChange}
                      placeholder="1 bowl (200g)"
                      className="input input-bordered"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Nutrition Score (0-10)</span>
                    </label>
                    <input
                      name="nutritionScore"
                      type="number"
                      step="0.1"
                      value={form.nutritionScore}
                      onChange={handleChange}
                      placeholder="7.5"
                      className="input input-bordered"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text mr-4">Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Delicious and nutritious meal description..."
                    className="textarea textarea-bordered"
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text mr-3">Image URL</span>
                  </label>
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/meal-image.jpg"
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text mr-3">
                      Allergens (comma-separated)
                    </span>
                  </label>
                  <input
                    name="allergens"
                    value={form.allergens}
                    onChange={handleChange}
                    placeholder="nuts, dairy, gluten"
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Ingredients (comma-separated)
                    </span>
                  </label>
                  <input
                    name="ingredients"
                    value={form.ingredients}
                    onChange={handleChange}
                    placeholder="lentils, tomatoes, onions, spices"
                    className="input input-bordered"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-outline btn-ghost w-full"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" /> : "Add Meal"}
                </button>
              </form>
            </div>
          </div>

          {/* Bulk Import & Meal List */}
          <div className="space-y-6">
            {/* Bulk Import */}
            <div className="card bg-zinc-700 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Bulk Import Meals</h2>
                <form onSubmit={handleBulkImport} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-300 mr-5">
                        CSV File
                      </span>
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setBulkImportFile(e.target.files[0])}
                      className="file-input file-input-bordered"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-secondary text-gray-300"
                    disabled={loading || !bulkImportFile}
                  >
                    {loading ? <LoadingSpinner size="sm" /> : "Import CSV"}
                  </button>
                </form>
              </div>
            </div>

            {/* ML Features Info */}
            {mlFeatures.length > 0 && (
              <div className="card bg-slate-600 shadow-lg text-white">
                <div className="card-body">
                  <h2 className="card-title">ML Model Features</h2>
                  <div className="text-sm">
                    <p className="mb-2">
                      Current ML model uses {mlFeatures.length} features:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {mlFeatures.map((feature) => (
                        <span key={feature} className="badge badge-outline">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meals List */}
        <div className="card bg-transparent shadow-lg mt-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Existing Meals</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Cuisine</th>
                    <th>Category</th>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th>Diet</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map((meal) => (
                    <tr key={meal._id}>
                      <td className="font-semibold">{meal.mealName}</td>
                      <td>
                        <span
                          className={`badge ${
                            meal.cuisine === "North Indian"
                              ? "badge-error"
                              : meal.cuisine === "South Indian"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {meal.cuisine}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-outline">
                          {meal.category}
                        </span>
                      </td>
                      <td>{meal.calories} cal</td>
                      <td>{meal.protein}g</td>
                      <td>
                        <span
                          className={`badge ${
                            meal.dietaryPreference === "Vegetarian"
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {meal.dietaryPreference}
                        </span>
                      </td>
                      <td>
                        {meal.averageRating ? (
                          <span>
                            {meal.averageRating.toFixed(1)} ⭐ (
                            {meal.totalRatings})
                          </span>
                        ) : (
                          <span className="text-gray-400">No ratings</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(meal._id)}
                          className="btn btn-sm btn-error"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMealForm;
