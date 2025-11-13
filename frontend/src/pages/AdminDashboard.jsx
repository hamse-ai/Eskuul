import React from "react";

const AdminDashboard = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 text-lg">
        Welcome, Admin! You have full access to manage the system.
      </p>
    </div>
  );
};

export default AdminDashboard;
