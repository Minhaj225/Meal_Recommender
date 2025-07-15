import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import StudentForm from "./pages/StudentForm.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import BrowseMeals from "./pages/BrowseMeals.jsx";
import AdminMealForm from "./pages/AdminMealForm.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Navigation from "./components/common/Navigation.jsx";

// Protected Route Component to prevent infinite re-renders
const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");

  useEffect(() => {
    // Listen for localStorage changes
    const handleStorageChange = () => {
      setIsAdmin(localStorage.getItem("isAdmin") === "true");
    };

    // Listen for storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminLoginChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminLoginChange', handleStorageChange);
    };
  }, []);

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-base-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<StudentForm />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/browse" element={<BrowseMeals />} />
          <Route
            path="/admin/meals"
            element={
              <ProtectedAdminRoute>
                <AdminMealForm />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

