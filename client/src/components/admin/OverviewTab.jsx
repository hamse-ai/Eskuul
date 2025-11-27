const OverviewTab = ({ pendingPdfsCount, pendingQuizzesCount, onNavigate }) => {
  const stats = [
    {
      title: "Pending PDFs",
      count: pendingPdfsCount,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      countColor: "text-yellow-600",
      description: "Awaiting review"
    },
    {
      title: "Pending Quizzes",
      count: pendingQuizzesCount,
      bgColor: "bg-purple-50",
      textColor: "text-purple-800",
      countColor: "text-purple-600",
      description: "Awaiting review"
    },
    {
      title: "Total Pending",
      count: pendingPdfsCount + pendingQuizzesCount,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      countColor: "text-blue-600",
      description: "Items to review"
    }
  ];

  const quickActions = [
    {
      title: "Review PDFs",
      count: pendingPdfsCount,
      label: "PDF",
      bgColor: "bg-yellow-500",
      hoverColor: "hover:bg-yellow-600",
      textColor: "text-yellow-100",
      onClick: () => onNavigate("pending-pdfs")
    },
    {
      title: "Review Quizzes",
      count: pendingQuizzesCount,
      label: "quiz",
      labelPlural: "quizzes",
      bgColor: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      textColor: "text-purple-100",
      onClick: () => onNavigate("pending-quizzes")
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} p-6 rounded-lg`}>
            <h3 className={`text-lg font-semibold ${stat.textColor}`}>
              {stat.title}
            </h3>
            <p className={`text-3xl font-bold ${stat.countColor} mt-2`}>
              {stat.count}
            </p>
            <p className="text-sm text-gray-600 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.bgColor} text-white p-4 rounded-lg ${action.hoverColor} transition text-left`}
            >
              <h4 className="font-semibold text-lg">{action.title}</h4>
              <p className={`text-sm mt-1 ${action.textColor}`}>
                {action.count} {action.count !== 1 ? (action.labelPlural || `${action.label}s`) : action.label} waiting
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
