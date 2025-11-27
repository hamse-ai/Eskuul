import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ user, setUser, menuItems, activeItem, onItemClick }) => {
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

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-600";
      case "teacher":
        return "bg-green-600";
      case "student":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const getRoleLabel = (role) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Don't render full sidebar if user is not loaded yet
  if (!user) {
    return (
      <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300 transition">
            Eskuul
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300 transition">
          Eskuul
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-white font-semibold`}>
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name || "User"}</p>
            <span className={`inline-block px-2 py-0.5 text-xs rounded ${getRoleColor(user.role)} text-white`}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                  activeItem === item.id
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
