const NavigationTabs = ({ activeTab, setActiveTab, pendingPdfsCount, pendingQuizzesCount }) => {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "pending-pdfs", label: "Pending PDFs", count: pendingPdfsCount },
    { id: "pending-quizzes", label: "Pending Quizzes", count: pendingQuizzesCount },
    { id: "analytics", label: "Analytics" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationTabs;
