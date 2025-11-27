const Card = ({ children, className = "", padding = "p-6" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${padding} ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

const CardContent = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>;
};

export { Card, CardHeader, CardContent };
