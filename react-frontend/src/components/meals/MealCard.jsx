import React, { useState } from "react";
import { mealAPI, studentAPI, apiUtils } from "../../services/api";

const MealCard = ({
  meal,
  onRate,
  onFeedback,
  showRating = true,
  showFeedback = false,
  userEmail,
}) => {
  const [rating, setRating] = useState(0);
  const [isRating, setIsRating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleRating = async (newRating) => {
    if (!userEmail) {
      alert("Please provide your email to rate meals");
      return;
    }

    setIsRating(true);
    try {
      await mealAPI.rateMeal(meal._id, newRating, userEmail);
      setRating(newRating);
      if (onRate) onRate(meal._id, newRating);

      // Auto-record feedback based on rating using the correct API
      if (showFeedback) {
        const liked = newRating >= 3;
        if (onFeedback) {
          // Use the onFeedback prop to let parent handle the API call
          onFeedback(meal._id, liked);
        } else {
          // Fallback: call studentAPI directly
          await studentAPI.recordFeedback(userEmail, meal._id, liked);
        }
        setFeedback(liked);
      }
    } catch (error) {
      console.error("Error rating meal:", error);
      alert("Failed to submit rating");
    } finally {
      setIsRating(false);
    }
  };

  const formattedMeal = apiUtils.formatMealData(meal);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-lg">{meal.mealName}</h3>
          {meal.confidence && (
            <div className="badge badge-info">
              {Math.round(meal.confidence * 100)}% match
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`badge ${apiUtils.getCuisineColor(meal.cuisine)}`}>
            {meal.cuisine}
          </span>
          <span
            className={`badge ${apiUtils.getDietColor(meal.dietaryPreference)}`}
          >
            {meal.dietaryPreference}
          </span>
          <span className="badge badge-outline">{meal.category}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="stat">
            <div className="stat-title text-sm">Calories</div>
            <div className="stat-value text-sm">{meal.calories} kcal</div>
          </div>
          <div className="stat">
            <div className="stat-title text-sm">Protein</div>
            <div className="stat-value text-sm">{meal.protein} g</div>
          </div>
        </div>

        {meal.description && (
          <p className="text-md text-gray-300 mt-2">{meal.description}</p>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-gray-500">
            {formattedMeal.ratingDisplay}
          </div>
          {meal.mlRecommended && (
            <div className="badge badge-success text-xs">AI Recommended</div>
          )}
        </div>

        {showRating && (
          <div className="card-actions justify-center mt-4">
            <div className="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  name={`rating-${meal._id}`}
                  className={`mask mask-star-2 ${
                    star <= (rating || meal.userRating || 0)
                      ? "bg-orange-400"
                      : "bg-gray-300"
                  }`}
                  onClick={() => handleRating(star)}
                  disabled={isRating}
                />
              ))}
            </div>
            {isRating && (
              <span className="loading loading-spinner loading-xs ml-2"></span>
            )}
          </div>
        )}

        {feedback !== null && (
          <div
            className={`alert ${
              feedback ? "alert-success" : "alert-warning"
            } mt-2`}
          >
            <span className="text-xs">
              {feedback
                ? "👍 Added to favorites!"
                : "👎 We'll improve recommendations"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCard;
