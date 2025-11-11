import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Enhanced ML API functions (direct calls to ML service)
export const mlAPI = {
  // Get ML model features
  getFeatures: async () => {
    const response = await axios.get(`${ML_API_URL}/features`);
    return response.data;
  },

  // Single meal prediction
  predictMeal: async (mealData) => {
    const response = await axios.post(`${ML_API_URL}/predict`, mealData);
    return response.data;
  },

  // Batch meal predictions
  predictMealsBatch: async (meals) => {
    const response = await axios.post(`${ML_API_URL}/predict_batch`, { meals });
    return response.data;
  },

  // ML API health check
  healthCheck: async () => {
    const response = await axios.get(`${ML_API_URL}/health`);
    return response.data;
  },

  // Get ML API info
  getInfo: async () => {
    const response = await axios.get(`${ML_API_URL}/`);
    return response.data;
  }
};

// Enhanced meal API functions
export const mealAPI = {
  // Get all meals with filtering
  getMeals: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/meals?${params}`);
    return response.data;
  },

  // Get meal by ID
  getMealById: async (id) => {
    const response = await api.get(`/meals/${id}`);
    return response.data;
  },

  // Get recommendations for a student with enhanced options
  getRecommendations: async (email, options = {}) => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/meals/recommend/${email}?${params}`);
    return response.data;
  },

  // Rate a meal
  rateMeal: async (mealId, rating, email) => {
    const response = await api.post(`/meals/${mealId}/rate`, {
      rating,
      email
    });
    return response.data;
  },

  // Create meal (admin)
  createMeal: async (mealData) => {
    const response = await api.post('/meals', mealData);
    return response.data;
  },

  // Update meal (admin)
  updateMeal: async (id, mealData) => {
    const response = await api.put(`/meals/${id}`, mealData);
    return response.data;
  },

  // Delete meal (admin)
  deleteMeal: async (id) => {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
  },

  // Bulk import meals (admin)
  bulkImportMeals: async (meals) => {
    const response = await api.post('/meals/bulk-import', { meals });
    return response.data;
  },

  // Search meals with advanced filtering
  searchMeals: async (searchTerm, filters = {}) => {
    const params = new URLSearchParams({ search: searchTerm });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/meals/search?${params}`);
    return response.data;
  }
};

// Enhanced student API functions
export const studentAPI = {
  // Create or update student profile
  createOrUpdateProfile: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  // Get student profile by email
  getProfile: async (email) => {
    const response = await api.get(`/students/${email}`);
    return response.data;
  },

  // Get all students (admin)
  getAllStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  // Record meal feedback
  recordFeedback: async (email, mealId, liked) => {
    const response = await api.post(`/students/${email}/feedback`, {
      mealId,
      liked
    });
    return response.data;
  },

  // Delete student profile
  deleteProfile: async (email) => {
    const response = await api.delete(`/students/${email}`);
    return response.data;
  },

  // Get student meal history
  getMealHistory: async (email) => {
    const response = await api.get(`/students/${email}/history`);
    return response.data;
  },

  // Update student preferences only
  updatePreferences: async (email, preferences) => {
    const response = await api.put(`/students/${email}/preferences`, preferences);
    return response.data;
  }
};

// System API functions
export const systemAPI = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // API info
  getApiInfo: async () => {
    const response = await api.get('/');
    return response.data;
  }
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Format meal data for display
  formatMealData: (meal) => ({
    ...meal,
    formattedCalories: `${meal.calories} kcal`,
    formattedProtein: `${meal.protein}g protein`,
    formattedCarbs: meal.carbohydrates ? `${meal.carbohydrates}g carbs` : '',
    formattedFats: meal.fats ? `${meal.fats}g fats` : '',
    nutritionSummary: `${meal.calories} cal • ${meal.protein}g protein`,
    ratingDisplay: meal.averageRating ? `${meal.averageRating.toFixed(1)} ⭐ (${meal.totalRatings})` : 'No ratings'
  }),

  // Validate email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Get cuisine color for UI
  getCuisineColor: (cuisine) => {
    const colors = {
      'North Indian': 'bg-orange-300 text-black',
      'South Indian': 'bg-green-300 text-black',
      'Street Food': 'bg-yellow-300 text-black',
      'General': 'bg-gray-100 text-gray-900'
    };
    return colors[cuisine] || colors['General'];
  },

  // Get category icon
  getCategoryIcon: (category) => {
    const icons = {
      'Main Dish': '🍽️',
      'Breakfast': '🌅',
      'Snack': '🍿',
      'Side Dish': '🥗',
      'Staple': '🍚'
    };
    return icons[category] || '🍽️';
  },

  // Get diet preference color
  getDietColor: (diet) => {
    return diet === 'Vegetarian' 
      ? 'bg-green-300 text-black' 
      : 'bg-orange-300 text-black';
  }
};

export default api;
