import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Map, Megaphone, Ticket, Brain, BarChart3,
  Bell, Shield, Settings, ChevronLeft, ChevronRight, LogOut, BookOpen, ClipboardList
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Customer', 'Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin'] },
  { label: 'Profiles', icon: Users, path: '/profiles', roles: ['Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin'] },
  { label: 'Journey', icon: Map, path: '/journey', roles: ['Customer', 'Service Agent', 'Admin'] },
  { label: 'Tickets', icon: Ticket, path: '/tickets', roles: ['Customer', 'Service Agent', 'Admin'] },
  { label: 'Campaigns', icon: Megaphone, path: '/campaigns', roles: ['Marketing Manager', 'Admin'] },
  { label: 'AI Center', icon: Brain, path: '/ai', roles: ['Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin'] },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['Marketing Manager', 'Sales Manager', 'Admin'] },
  { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['Customer', 'Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin'] },
  { label: 'Users', icon: Shield, path: '/admin/users', roles: ['Admin'] },
  { label: 'Audit Logs', icon: ClipboardList, path: '/admin/audit', roles: ['Admin'] },
  { label: 'Settings', icon: Settings, path: '/admin/settings', roles: ['Admin'] },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item => hasRole(...item.roles));

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-sm">LearnFlow</span>
            <span className="text-indigo-400 font-bold text-sm"> AI</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="flex-shrink-0 nav-icon" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Collapse */}
      <div className="border-t border-slate-700 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.firstName} {user.lastName}</p>
              <p className="text-slate-500 text-xs truncate">{user.role?.name}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={onToggle}
          className="sidebar-nav-item w-full mt-1"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
