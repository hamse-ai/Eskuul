import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

axios.defaults.withCredentials = true;

// Layout component that conditionally renders Navbar
const Layout = ({ user, setUser, children }) => {
  const location = useLocation();
  const dashboardPaths = ["/admin", "/teacher", "/student"];
  const isDashboard = dashboardPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      {!isDashboard && <Navbar user={user} setUser={setUser} />}
      {children}
    </>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/auth/me");
        setUser(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <h1>Loading...</h1>;

  return (
    <Router>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} />

          {/* Admin Only Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin"]}>
                <AdminDashboard user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />

          {/* Teacher Only Route */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute user={user} allowedRoles={["teacher"]}>
                <TeacherDashboard user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />

          {/* Student Only Route */}
          <Route
            path="/student"
            element={
              <ProtectedRoute user={user} allowedRoles={["student"]}>
                <StudentDashboard user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
