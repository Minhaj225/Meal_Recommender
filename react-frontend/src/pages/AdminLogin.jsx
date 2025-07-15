import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { systemAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in as admin
    if (localStorage.getItem("isAdmin") === "true") {
      navigate("/admin/meals", { replace: true });
    }
    
    // Load system status
    loadSystemStatus();
  }, [navigate]);

  const loadSystemStatus = async () => {
    try {
      const [healthData, apiData] = await Promise.all([
        systemAPI.healthCheck(),
        systemAPI.getApiInfo()
      ]);
      setSystemStatus({ health: healthData, api: apiData });
    } catch (err) {
      console.error('Error loading system status:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simple hardcoded admin check (in production, this would be a proper API call)
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminUser", username);
        
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new Event('adminLoginChange'));
        
        // Navigate with replace to avoid going back to login
        navigate("/admin/meals", { replace: true });
      } else {
        setError("Invalid credentials. Use admin/admin123 for demo.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error('Login error:', err);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminUser");
    setUsername("");
    setPassword("");
  };

  const isLoggedIn = localStorage.getItem("isAdmin") === "true";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* System Status Card */}
        {systemStatus && (
          <div className="card bg-base-100 shadow-lg mb-6">
            <div className="card-body">
              <h3 className="card-title text-sm">🔧 System Status</h3>
              <div className="flex justify-between text-xs">
                <span>Backend:</span>
                <span className={`badge ${systemStatus.health.status === 'healthy' ? 'badge-success' : 'badge-error'}`}>
                  {systemStatus.health.status}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Database:</span>
                <span className={`badge ${systemStatus.health.dbStatus === 'connected' ? 'badge-success' : 'badge-error'}`}>
                  {systemStatus.health.dbStatus}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>ML API:</span>
                <span className={`badge ${systemStatus.api.mlIntegration?.enabled ? 'badge-success' : 'badge-warning'}`}>
                  {systemStatus.api.mlIntegration?.enabled ? 'Connected' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Version:</span>
                <span className="badge badge-outline">{systemStatus.api.version}</span>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="card bg-amber-900 shadow-xl">
          <div className="card-body">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">🔐 Admin Login</h1>
              <p className="text-gray-200 mt-2">
                Access the meal management dashboard
              </p>
            </div>

            {isLoggedIn ? (
              <div className="text-center space-y-4">
                <div className="alert alert-success">
                  <span>✅ You are logged in as admin</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/admin/meals" className="btn btn-primary">
                    Go to Admin Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <ErrorMessage message={error} />}
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text mr-3">Username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input input-bordered"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text mr-4">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered"
                    required
                    disabled={loading}
                  />
                  <label className="label">
                    <span className="label-text-alt text-info mt-5 mb-3">
                      💡 Demo credentials: admin / admin123
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" /> : "Login"}
                </button>
              </form>
            )}

            <div className="divider">Quick Access</div>
            
            <div className="flex flex-col gap-2">
              <Link to="/" className="btn btn-outline btn-sm">
                🏠 Back to Home
              </Link>
              <Link to="/browse" className="btn btn-outline btn-sm">
                🔍 Browse Meals (Public)
              </Link>
            </div>

            {/* Admin Features Info */}
            <div className="mt-6 p-4 bg-base-200 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">🎛️ Admin Features:</h4>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>• Add, edit, and delete meals</li>
                <li>• Bulk import meals from CSV</li>
                <li>• View meal analytics and ratings</li>
                <li>• Monitor ML model integration</li>
                <li>• Manage system settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;