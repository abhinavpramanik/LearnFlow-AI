import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Map, Megaphone, Ticket, Brain, BarChart3,
  Bell, Shield, Settings, ChevronLeft, ChevronRight, LogOut, BookOpen, ClipboardList
} from 'lucide-react';
import { cn } from '../common';
import { Button } from '../ui/button';

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
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-card border-r border-border h-screen fixed top-0 left-0 flex flex-col z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border h-16 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <BookOpen size={16} className="text-primary" />
        </div>
        <AnimateText show={!collapsed}>
          <span className="text-foreground font-bold text-sm tracking-wide">LearnFlow</span>
          <span className="text-primary font-bold text-sm tracking-wide"> AI</span>
        </AnimateText>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all group",
              isActive 
                ? "bg-primary/15 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon size={20} className="shrink-0" />
            <AnimateText show={!collapsed}>
              {item.label}
            </AnimateText>
          </NavLink>
        ))}
      </nav>

      {/* User + Collapse */}
      <div className="border-t border-border p-3 space-y-1 shrink-0">
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start text-muted-foreground hover:text-foreground", collapsed ? "px-0 justify-center" : "px-3")}
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} className="mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
};

// Helper component to animate text hiding/showing smoothly
const AnimateText = ({ show, children }) => (
  <motion.div
    initial={false}
    animate={{ 
      opacity: show ? 1 : 0, 
      width: show ? 'auto' : 0,
      display: show ? 'block' : 'none'
    }}
    transition={{ duration: 0.2 }}
    className="whitespace-nowrap overflow-hidden"
  >
    {children}
  </motion.div>
);

export default Sidebar;
