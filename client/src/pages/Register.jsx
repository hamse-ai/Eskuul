import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = ({ setUser }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const res = await axios.post("http://localhost:3000/api/auth/register", form, {
      withCredentials: true
    });
    console.log("form: " + form);
    setUser(res.data.user);
    navigate('/')
    // redirect or show success message
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
  }
  };

  return (
<div className="min-h-[80vh] flex items-center justify-center p-4">
  <form
    className="bg-white p-6 rounded shadow-md w-full max-w-lg"
    onSubmit={handleSubmit}
  >
    <h2 className="text-2xl mb-6 font-bold text-center text-gray-800">
      Register
    </h2>

    {error && <p className="text-red-500 mb-4">{error}</p>}

    <input
      type="text"
      placeholder="Name"
      className="border p-2 w-full mb-3"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
    />

    <input
      type="email"
      placeholder="Email"
      className="border p-2 w-full mb-3"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
    />

    <input
      type="password"
      placeholder="Password"
      className="border p-2 w-full mb-3"
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
    />

    {/* Role Field */}
    <label htmlFor="">Sign up as</label>
    <select
      className="border p-2 w-full mb-4"
      value={form.role}
      onChange={(e) => setForm({ ...form, role: e.target.value })}
      required
    >
      <option value="">Select role</option>
      <option value="student">Student</option>
      <option value="teacher">Teacher</option>
      <option value="admin">Admin</option>
    </select>

    <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 w-full rounded transition">
      Register
    </button>
  </form>
</div>

  );
};

export default Register;