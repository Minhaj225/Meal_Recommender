const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const studentRoutes = require("./routes/studentRoutes");
const mealRoutes = require("./routes/mealRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://meal-recommender-nine.vercel.app",
    "https://meal-recommender-backend.vercel.app",
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/meals", mealRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Meal Recommender Backend API",
    version: "2.0.0",
    status: "running",
    endpoints: {
      "/api": "API information",
      "/api/health": "Health check",
      "/api/students": "Student management",
      "/api/meals": "Meal management"
    }
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "Meal Recommender Backend API",
    version: "2.0.0",
    description: "Enhanced backend API for AI-powered meal recommendations",
    endpoints: {
      "/api/health": "GET - API health check",
      "/api/students": "Student management endpoints",
      "/api/meals": "Meal management and recommendation endpoints"
    },
    mlIntegration: {
      enabled: true,
      apiUrl: process.env.ML_API_URL || "http://localhost:5000"
    }
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    availableEndpoints: ["/api", "/api/health", "/api/students", "/api/meals"]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: "Validation Error",
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: "Invalid ID format",
      details: err.message
    });
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate entry",
      details: "A record with this information already exists"
    });
  }
  
  // Default error
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong"
  });
});

// DB Connection with better error handling
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected successfully");
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// MongoDB connection event handlers
mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 ML API URL: ${process.env.ML_API_URL || 'http://localhost:5000'}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
