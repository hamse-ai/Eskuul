import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = ({ user, error }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard based on role
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/teacher");
      } else if (user.role === "student") {
        navigate("/student");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
        {error && <p className="text-red-500">{error}</p>}
        {user ? (
          <div>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Please log in or register.
            </h2>
            <div className="flex flex-col gap-y-4">
              <Link
                to="/login"
                className="w-full text-white bg-blue-500 p-3 rounded-md hover:bg-blue-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full text-gray-800 bg-gray-200 p-3 rounded-md hover:bg-gray-300 font-medium"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;