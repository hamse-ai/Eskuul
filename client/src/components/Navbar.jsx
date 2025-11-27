import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Eskuul</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* User info */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                    user.role === "admin" ? "bg-purple-500" :
                    user.role === "teacher" ? "bg-green-500" : "bg-blue-500"
                  }`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.role === "admin" ? "bg-purple-100 text-purple-700" :
                    user.role === "teacher" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {user.role}
                  </span>
                </div>

                {/* Dashboard link */}
                <Link
                  to={user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/student"}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Dashboard
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
