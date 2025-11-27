import { Sidebar } from "../ui";

const DashboardLayout = ({
  user,
  setUser,
  menuItems,
  activeItem,
  onItemClick,
  title,
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        user={user}
        setUser={setUser}
        menuItems={menuItems}
        activeItem={activeItem}
        onItemClick={onItemClick}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Page Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
