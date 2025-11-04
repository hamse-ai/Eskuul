import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    const res = await axios.post(
      "http://localhost:3000/api/auth/logout",
      {},
      { withCredentials: true }
    );

    console.log(res.data.message); // "Logged out successfully"

    // Clear frontend user state
    setUser(null);

    // Wait a tick before navigating to ensure React updates
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 100);

  } catch (err) {
    console.error("Logout failed:", err);
  }
};


  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-lg hover:text-gray-300 transition">
          PERN Auth
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-300">
                👋 Welcome, {user.username || user.email || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mx-2 hover:text-gray-300 transition">
                Login
              </Link>
              <Link to="/register" className="mx-2 hover:text-gray-300 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
