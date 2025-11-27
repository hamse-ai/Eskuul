const StatusBadge = ({ status, size = "md" }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "lg":
        return "px-4 py-1.5 text-sm";
      default:
        return "px-3 py-1 text-xs";
    }
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${getStatusStyles()} ${getSizeStyles()}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default StatusBadge;
