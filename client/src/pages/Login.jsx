import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const api = import.meta.env.VITE_API_URL;

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("")
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${api}/api/auth/login`,
        { email, password, role },
        { withCredentials: true }
      );

      // ✅ Set user immediately after login
      setUser(res.data.user);
      navigate("/"); // redirect to home
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-lg"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl mb-6 font-bold text-center text-gray-800">
          Login
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          className="border p-2 w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
         <label htmlFor="">Sign in as</label>
         <select
           className="border p-2 w-full mb-4"
           value={role}
           onChange={(e) => setRole(e.target.value)}
           required
         >
           <option value="">Select role</option>
           <option value="student">Student</option>
           <option value="teacher">Teacher</option>
           <option value="admin">Admin</option>
         </select>
        <button className="bg-blue-500 text-white p-2 w-full">Login</button>
      </form>
    </div>
  );
};

export default Login;
