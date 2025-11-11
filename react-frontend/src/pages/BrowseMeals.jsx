import React, { useState, useEffect } from "react";
import { mealAPI, apiUtils } from "../services/api";
import MealCard from "../components/meals/MealCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const BrowseMeals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    cuisine: "",
    category: "",
    dietaryPreference: "",
    minCalories: "",
    maxCalories: "",
    minProtein: "",
  });
  const [userEmail, setUserEmail] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  const cuisineOptions = [
    "",
    "North Indian",
    "South Indian",
    "Street Food",
    "General",
  ];
  const categoryOptions = [
    "",
    "Main Dish",
    "Breakfast",
    "Snack",
    "Side Dish",
    "Staple",
  ];
  const dietOptions = ["", "Vegetarian", "Non-Vegetarian"];
  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "rating", label: "Rating" },
    { value: "calories", label: "Calories (Low to High)" },
    { value: "protein", label: "Protein (High to Low)" },
  ];

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
    fetchMeals();
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [filters, sortBy]);

  const fetchMeals = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await mealAPI.getMeals(filters);

      if (response.success) {
        let sortedMeals = [...response.meals];

        // Apply sorting
        switch (sortBy) {
          case "rating":
            sortedMeals.sort(
              (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
            );
            break;
          case "calories":
            sortedMeals.sort((a, b) => a.calories - b.calories);
            break;
          case "protein":
            sortedMeals.sort((a, b) => b.protein - a.protein);
            break;
          default: // popularity
            sortedMeals.sort(
              (a, b) => (b.popularity || 0) - (a.popularity || 0)
            );
        }

        setMeals(sortedMeals);
      } else {
        setError("Failed to fetch meals");
      }
    } catch (error) {
      setError(apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      cuisine: "",
      category: "",
      dietaryPreference: "",
      minCalories: "",
      maxCalories: "",
      minProtein: "",
    });
  };

  const handleRating = (mealId, rating) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal._id === mealId ? { ...meal, userRating: rating } : meal
      )
    );
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse All Meals</h1>
          <p className="text-lg text-gray-600">
            Explore our comprehensive collection of delicious and nutritious
            meals
          </p>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title font-bold">Filter & Search</h3>
              <button onClick={clearFilters} className="btn btn-sm btn-outline">
                Clear All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Cuisine</span>
                </label>
                <select
                  value={filters.cuisine}
                  onChange={(e) =>
                    handleFilterChange("cuisine", e.target.value)
                  }
                  className="select select-bordered select-sm"
                >
                  {cuisineOptions.map((option) => (
                    <option key={option} value={option}>
                      {option || "All Cuisines"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="select select-bordered select-sm"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option || "All Categories"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Diet</span>
                </label>
                <select
                  value={filters.dietaryPreference}
                  onChange={(e) =>
                    handleFilterChange("dietaryPreference", e.target.value)
                  }
                  className="select select-bordered select-sm"
                >
                  {dietOptions.map((option) => (
                    <option key={option} value={option}>
                      {option || "All Diets"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Min Calories</span>
                </label>
                <input
                  type="number"
                  value={filters.minCalories}
                  onChange={(e) =>
                    handleFilterChange("minCalories", e.target.value)
                  }
                  className="input input-bordered input-sm"
                  placeholder="e.g., 100"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Calories</span>
                </label>
                <input
                  type="number"
                  value={filters.maxCalories}
                  onChange={(e) =>
                    handleFilterChange("maxCalories", e.target.value)
                  }
                  className="input input-bordered input-sm"
                  placeholder="e.g., 500"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Min Protein (g)</span>
                </label>
                <input
                  type="number"
                  value={filters.minProtein}
                  onChange={(e) =>
                    handleFilterChange("minProtein", e.target.value)
                  }
                  className="input input-bordered input-sm"
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Sort by</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select select-bordered select-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Found {meals.length} meals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Input for Rating */}
        {!userEmail && (
          <div className="alert alert-info mb-8 bg-stone-600">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current flex-shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div className="text-white">
                <p>Want to rate meals? Enter your email:</p>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="input input-bordered input-sm mt-2"
                  placeholder="your-email@example.com"
                />
              </div>
            </div>
            <div className="flex-none">
              <button
                onClick={() => localStorage.setItem("userEmail", userEmail)}
                className="btn btn-sm text-white"
                disabled={!apiUtils.validateEmail(userEmail)}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && <ErrorMessage message={error} onRetry={fetchMeals} />}

        {/* Loading State */}
        {loading && <LoadingSpinner message="Loading delicious meals..." />}

        {/* Meals Grid */}
        {!loading && meals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {meals.map((meal) => (
              <MealCard
                key={meal._id}
                meal={meal}
                onRate={handleRating}
                showRating={true}
                userEmail={userEmail}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && meals.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold mb-2">No Meals Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters to see more results
            </p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseMeals;
