import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const sidebarWidth = collapsed ? 64 : 260;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main Content Area */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-muted/20">
          <AnimatePresence mode="wait">
            <div key={location.pathname} className="h-full">
              <Outlet />
            </div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
