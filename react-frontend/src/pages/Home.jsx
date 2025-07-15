import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { mealAPI, systemAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import MealCard from "../components/meals/MealCard";

const Home = () => {
  const [stats, setStats] = useState(null);
  const [featuredMeals, setFeaturedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiInfo, setApiInfo] = useState(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get API info and health check
      const [apiInfoData, healthData] = await Promise.all([
        systemAPI.getApiInfo(),
        systemAPI.healthCheck()
      ]);

      setApiInfo(apiInfoData);

      // Get featured meals (high rating, popular)
      const mealsResponse = await mealAPI.getMeals({
        limit: 6
      });

      const meals = mealsResponse.meals || [];
      
      // Sort by rating and popularity for featured meals
      const featured = meals
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0) + (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 6);

      setFeaturedMeals(featured);

      // Calculate stats
      const cuisineStats = {};
      const categoryStats = {};
      meals.forEach(meal => {
        cuisineStats[meal.cuisine] = (cuisineStats[meal.cuisine] || 0) + 1;
        categoryStats[meal.category] = (categoryStats[meal.category] || 0) + 1;
      });

      setStats({
        totalMeals: meals.length,
        healthySystem: healthData.status === 'healthy',
        cuisineCount: Object.keys(cuisineStats).length,
        categoryCount: Object.keys(categoryStats).length,
        topCuisine: Object.entries(cuisineStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
        averageRating: meals.reduce((sum, meal) => sum + (meal.averageRating || 0), 0) / meals.length || 0
      });

    } catch (err) {
      console.error('Error loading home data:', err);
      setError('Failed to load application data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100">
      {/* Hero Section */}
      <div className="hero min-h-[70vh] bg-gradient-to-r from-primary to-secondary">
        <div className="hero-content text-center text-white">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold mb-6">🍽️ AI Meal Recommender</h1>
            <p className="text-xl mb-8">
              Personalized, AI-powered meal recommendations for diverse student communities.
              Get nutrition-focused suggestions tailored to your preferences and goals.
            </p>
            
            {error && <ErrorMessage message={error} />}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/profile" className="btn btn-lg btn-primary">
                📝 Create Profile
              </Link>
              <Link to="/recommendations" className="btn btn-lg btn-secondary">
                🤖 Get AI Recommendations
              </Link>
              <Link to="/browse" className="btn btn-lg btn-accent">
                🔍 Browse Meals
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Section */}
        {stats && (
          <div className="mb-16 ">
            <h2 className="text-3xl font-bold text-center mb-8 text-amber-950">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat bg-white shadow-lg rounded-lg">
                <div className="stat-figure text-primary">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div className="stat-title text-amber-950">Total Meals</div>
                <div className="stat-value text-primary">{stats.totalMeals}</div>
                <div className="stat-desc text-amber-950">Available in database</div>
              </div>

              <div className="stat bg-white shadow-lg rounded-lg">
                <div className="stat-figure text-secondary">
                  <span className="text-2xl">🌶️</span>
                </div>
                <div className="stat-title text-amber-950">Cuisines</div>
                <div className="stat-value text-secondary">{stats.cuisineCount}</div>
                <div className="stat-desc text-amber-950">Most popular: {stats.topCuisine}</div>
              </div>

              <div className="stat bg-white shadow-lg rounded-lg">
                <div className="stat-figure text-accent">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="stat-title text-amber-950">Avg Rating</div>
                <div className="stat-value text-accent">{stats.averageRating.toFixed(1)}</div>
                <div className="stat-desc text-amber-950">Community ratings</div>
              </div>

              <div className="stat bg-white shadow-lg rounded-lg">
                <div className="stat-figure text-success">
                  <span className="text-2xl">{stats.healthySystem ? "✅" : "❌"}</span>
                </div>
                <div className="stat-title text-amber-950">System Status</div>
                <div className="stat-value text-success">
                  {stats.healthySystem ? "Healthy" : "Issues"}
                </div>
                <div className="stat-desc text-amber-950">
                  {apiInfo?.mlIntegration?.enabled ? "ML API Connected" : "ML API Offline"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mb-16 text-amber-950">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Our AI Meal Recommender?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-white shadow-lg">
              <div className="card-body text-center">
                <h3 className="card-title text-2xl mb-4">🤖 AI-Powered</h3>
                <p>
                  Our machine learning model analyzes your preferences, nutrition goals, and eating history 
                  to provide personalized recommendations.
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-lg">
              <div className="card-body text-center">
                <h3 className="card-title text-2xl mb-4">🥗 Nutrition-Focused</h3>
                <p>
                  Set your daily calorie and protein goals. Our system ensures recommendations 
                  align with your nutritional objectives.
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-lg">
              <div className="card-body text-center">
                <h3 className="card-title text-2xl mb-4">🌶️ Diverse Cuisines</h3>
                <p>
                  Explore North Indian, South Indian, Street Food, and more. 
                  Perfect for diverse student communities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Meals Section */}
        {featuredMeals.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-base-100">🌟 Featured Meals</h2>
              <Link to="/browse" className="btn btn-outline btn-primary">
                View All Meals
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMeals.map((meal) => (
                <MealCard key={meal._id} meal={meal} showRating={true} />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Personalized Meal Journey?</h2>
          <p className="text-lg mb-6">
            Create your profile in under 2 minutes and get AI-powered meal recommendations 
            tailored just for you.
          </p>
          <Link to="/profile" className="btn btn-soft btn-ghost btn-large">
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;