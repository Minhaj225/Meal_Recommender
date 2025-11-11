import React, { useState, useEffect } from "react";
import { mealAPI, studentAPI, apiUtils } from "../services/api";
import MealCard from "../components/meals/MealCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const Recommendations = () => {
  const [email, setEmail] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [student, setStudent] = useState(null);
  const [filters, setFilters] = useState({
    limit: 10,
    mealType: "",
  });

  // Load email from URL params or localStorage
  useEffect(() => {
    const urlEmail = new URLSearchParams(window.location.search).get("email");
    const savedEmail = localStorage.getItem("userEmail");
    if (urlEmail) {
      setEmail(urlEmail);
      localStorage.setItem("userEmail", urlEmail);
    } else if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Load student profile when email changes
  useEffect(() => {
    if (email && apiUtils.validateEmail(email)) {
      loadStudentProfile();
    }
  }, [email]);

  const loadStudentProfile = async () => {
    try {
      const response = await studentAPI.getProfile(email);
      if (response.success) {
        setStudent(response.student);
      }
    } catch (error) {
      console.log("Student profile not found");
      setStudent(null);
    }
  };

  const fetchRecommendations = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!apiUtils.validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      localStorage.setItem("userEmail", email);

      const response = await mealAPI.getRecommendations(email, filters);

      if (response.success) {
        setRecommendations(response.recommendations || []);

        if (response.recommendations.length === 0) {
          setError(
            "No recommendations found. Try updating your profile preferences."
          );
        }
      } else {
        setError("Failed to get recommendations");
      }
    } catch (error) {
      setError(apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (mealId, rating) => {
    try {
      // Submit rating to backend
      await mealAPI.rateMeal(mealId, rating, email);

      // Update the meal rating in the recommendations list
      setRecommendations((prev) =>
        prev.map((meal) =>
          meal._id === mealId ? { ...meal, userRating: rating } : meal
        )
      );

      // Show success message
      setSuccess(
        `✅ Rating submitted! You gave ${rating} star${
          rating !== 1 ? "s" : ""
        }.`
      );
      setError("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);

      console.log(`Successfully rated meal ${mealId} with ${rating} stars`);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      setError(`Failed to submit rating: ${apiUtils.handleError(error)}`);
      setSuccess("");
    }
  };

  const handleFeedback = async (mealId, liked) => {
    try {
      // Submit feedback to backend
      await studentAPI.recordFeedback(email, mealId, liked);

      // Update the meal feedback in the recommendations list
      setRecommendations((prev) =>
        prev.map((meal) =>
          meal._id === mealId ? { ...meal, userFeedback: liked } : meal
        )
      );

      // Show success message
      setSuccess(
        `✅ Feedback recorded! You ${liked ? "liked" : "disliked"} this meal.`
      );
      setError("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);

      console.log(
        `Successfully recorded feedback for meal ${mealId}: ${
          liked ? "liked" : "disliked"
        }`
      );
    } catch (error) {
      console.error("Failed to record feedback:", error);
      setError(`Failed to record feedback: ${apiUtils.handleError(error)}`);
      setSuccess("");
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const categoryOptions = [
    "",
    "Main Dish",
    "Breakfast",
    "Snack",
    "Side Dish",
    "Staple",
  ];

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Personalized Meal Recommendations
          </h1>
          <p className="text-lg text-gray-600">
            Get AI-powered meal suggestions based on your preferences and
            nutrition goals
          </p>
        </div>

        {/* Email Input and Filters */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="form-control md:col-span-2 mt-5.5">
                <label className="label">
                  <span className="label-text font-semibold mx-3">
                    Your Email
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered"
                  placeholder="Enter your email to get recommendations"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Meal Type</span>
                </label>
                <select
                  value={filters.mealType}
                  onChange={(e) =>
                    handleFilterChange("mealType", e.target.value)
                  }
                  className="select select-bordered"
                >
                  <option value="">All Types</option>
                  {categoryOptions.slice(1).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Number of Results</span>
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) =>
                    handleFilterChange("limit", parseInt(e.target.value))
                  }
                  className="select select-bordered"
                >
                  <option value={5}>5 meals</option>
                  <option value={10}>10 meals</option>
                  <option value={15}>15 meals</option>
                  <option value={20}>20 meals</option>
                </select>
              </div>
            </div>

            <div className="card-actions justify-center mt-6">
              <button
                onClick={fetchRecommendations}
                className={`btn btn-primary btn-lg ${loading ? "loading" : ""}`}
                disabled={loading || !email}
              >
                {loading
                  ? "Getting Recommendations..."
                  : "Get My Recommendations"}
              </button>
            </div>
          </div>
        </div>

        {/* Student Profile Summary */}
        {student && (
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h3 className="card-title text-2xl font-bold">
                Your Profile Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                <div>
                  <p>
                    <strong>Name:</strong> {student.name}
                  </p>
                  <p>
                    <strong>Diet:</strong>{" "}
                    {student.preferences?.dietaryPreference}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Preferred Cuisines:</strong>{" "}
                    {student.preferences?.cuisines?.join(", ") || "All"}
                  </p>
                  <p>
                    <strong>Activity Level:</strong> {student.activityLevel}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Daily Calories:</strong>{" "}
                    {student.nutritionGoals?.caloriesPerDay}
                  </p>
                  <p>
                    <strong>Daily Protein:</strong>{" "}
                    {student.nutritionGoals?.proteinGramsPerDay}g
                  </p>
                </div>
              </div>
              <div className="card-actions justify-end">
                <a
                  href={`/profile?email=${email}`}
                  className="btn btn-sm btn-outline"
                >
                  Edit Profile
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <ErrorMessage message={error} onRetry={fetchRecommendations} />
        )}

        {/* Success Display */}
        {success && (
          <div className="alert alert-success mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <LoadingSpinner message="Finding the perfect meals for you..." />
        )}

        {/* No Profile Warning */}
        {email && !student && !loading && (
          <div className="alert alert-warning mb-8">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>
                No profile found for this email. Create your profile first for
                better recommendations!
              </span>
            </div>
            <div className="flex-none">
              <a href={`/profile?email=${email}`} className="btn btn-sm">
                Create Profile
              </a>
            </div>
          </div>
        )}

        {/* Recommendations Grid */}
        {recommendations.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                🎯 Your Recommendations ({recommendations.length})
              </h2>
              <div className="text-sm text-gray-600">
                {recommendations.filter((m) => m.mlRecommended).length}{" "}
                AI-powered recommendations
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((meal) => (
                <MealCard
                  key={meal._id}
                  meal={meal}
                  onRate={handleRating}
                  onFeedback={handleFeedback}
                  showRating={true}
                  showFeedback={true}
                  userEmail={email}
                />
              ))}
            </div>

            {/* Recommendations Info */}
            <div className="card bg-base-100 shadow-xl mt-8">
              <div className="card-body">
                <h3 className="card-title">📊 Recommendation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="stat">
                    <div className="stat-title">Total Meals Evaluated</div>
                    <div className="stat-value text-lg">99</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">AI Recommendations</div>
                    <div className="stat-value text-lg">
                      {recommendations.filter((m) => m.mlRecommended).length}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Avg Confidence</div>
                    <div className="stat-value text-lg">
                      {recommendations.length > 0
                        ? Math.round(
                            (recommendations.reduce(
                              (acc, m) => acc + (m.confidence || 0),
                              0
                            ) /
                              recommendations.length) *
                              100
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>

                <div className="alert alert-info mt-4">
                  <div className="text-sm">
                    <p>
                      <strong>💡 How it works:</strong>
                    </p>
                    <p>
                      Our AI analyzes your preferences, nutrition goals, and
                      dietary restrictions to find meals you'll love. Rate meals
                      to improve future recommendations!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && recommendations.length === 0 && !error && email && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-6">
              Enter your email and click "Get My Recommendations" to discover
              amazing meals!
            </p>
            {!student && (
              <a href={`/profile?email=${email}`} className="btn btn-primary">
                Create Your Profile First
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
