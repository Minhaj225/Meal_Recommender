import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import mainlogo from "./icons/nav-logo.png";
import admin from "./icons/admin.png";
import user from "./icons/user.png";

const Navigation = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );

  useEffect(() => {
    // Listen for admin login/logout changes
    const handleAdminChange = () => {
      setIsAdmin(localStorage.getItem("isAdmin") === "true");
    };

    window.addEventListener("adminLoginChange", handleAdminChange);
    window.addEventListener("storage", handleAdminChange);

    return () => {
      window.removeEventListener("adminLoginChange", handleAdminChange);
      window.removeEventListener("storage", handleAdminChange);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              ></path>
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/recommendations">Recommendations</Link>
            </li>
            <li>
              <Link to="/browse">Browse Meals</Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin/meals">Admin</Link>
              </li>
            )}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Nutri<div className="text-green-500">Goal</div>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/" className={isActive("/") ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={isActive("/profile") ? "active" : ""}
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/recommendations"
              className={isActive("/recommendations") ? "active" : ""}
            >
              Recommendations
            </Link>
          </li>
          <li>
            <Link to="/browse" className={isActive("/browse") ? "active" : ""}>
              Browse Meals
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                to="/admin/meals"
                className={isActive("/admin/meals") ? "active" : ""}
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              {isAdmin ? (
                <img src={admin} alt="Admin" className="w-6 h-6" />
              ) : (
                <img src={user} alt="User" className="w-6 h-6" />
              )}
            </div>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/profile">Edit Profile</Link>
            </li>
            <li>
              <Link to="/recommendations">Get Recommendations</Link>
            </li>
            <li>
              <Link to="/browse">Browse All Meals</Link>
            </li>
            <div className="divider my-1"></div>
            <li>
              <Link to="/admin/login">
                {isAdmin ? "Admin Dashboard" : "Admin Login"}
              </Link>
            </li>
            {isAdmin && (
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem("isAdmin");
                    localStorage.removeItem("adminUser");
                    // Dispatch custom event to notify other components
                    window.dispatchEvent(new Event("adminLoginChange"));
                    window.location.href = "/";
                  }}
                >
                  Admin Logout
                </a>
              </li>
            )}
            <li>
              <a
                href="#"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
              >
                Clear All Data
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
