const StatCard = ({ title, value, subtitle, color = "blue", onClick }) => {
  const colorStyles = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-green-50 border-green-100",
    yellow: "bg-yellow-50 border-yellow-100",
    purple: "bg-purple-50 border-purple-100",
    red: "bg-red-50 border-red-100",
  };

  const textStyles = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    red: "text-red-600",
  };

  const titleStyles = {
    blue: "text-blue-800",
    green: "text-green-800",
    yellow: "text-yellow-800",
    purple: "text-purple-800",
    red: "text-red-800",
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`${colorStyles[color]} border rounded-xl p-5 text-left transition ${
        onClick ? "hover:shadow-md cursor-pointer" : ""
      }`}
    >
      <h4 className={`text-sm font-medium ${titleStyles[color]}`}>{title}</h4>
      <p className={`text-3xl font-bold ${textStyles[color]} mt-2`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </Component>
  );
};

export default StatCard;
