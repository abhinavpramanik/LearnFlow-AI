import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getNotifications({ read: false, limit: 1 });
        setUnreadCount(res.data.data?.unreadCount || 0);
      } catch {
        // Silently fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 glass border-b border-slate-700 flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search profiles, tickets, campaigns..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input pl-9 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500">{user?.role?.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
