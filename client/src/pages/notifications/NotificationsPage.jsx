import { useState, useEffect } from 'react';
import { notificationService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState } from '../../components/common';
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const SEV_CONFIG = {
  Info: { icon: Info, color: 'badge-info', iconColor: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/20' },
  Warning: { icon: AlertTriangle, color: 'badge-warning', iconColor: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
  Urgent: { icon: AlertCircle, color: 'badge-error', iconColor: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20' },
  System: { icon: Zap, color: 'badge-neutral', iconColor: 'text-slate-400', bg: 'bg-slate-700/50 border-slate-600/30' },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'unread') params.read = false;
      const res = await notificationService.getNotifications(params);
      setNotifications(res.data.data?.notifications || []);
      setUnreadCount(res.data.data?.unreadCount || 0);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [filter]);

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch { toast.error('Failed to mark as read'); }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id);
      fetchNotifications();
    } catch {}
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={<>Notifications {unreadCount > 0 && <span className="ml-2 badge badge-brand">{unreadCount} new</span>}</>}
        subtitle="Stay updated with system alerts, AI completions, and assignments"
        actions={unreadCount > 0 && (
          <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAllRead}>Mark all read</Button>
        )}
      />

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl w-fit">
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      <Card>
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description={filter === 'unread' ? 'All caught up!' : 'No notifications yet'} />
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const sev = SEV_CONFIG[n.severity] || SEV_CONFIG.Info;
              return (
                <div key={n._id}
                  onClick={() => !n.read && markRead(n._id)}
                  className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer ${!n.read ? sev.bg : 'border-transparent hover:bg-slate-800/50'}`}>
                  <div className={`p-2 rounded-lg ${!n.read ? 'bg-current/10' : 'bg-slate-800'} flex-shrink-0 h-fit`}>
                    <sev.icon size={18} className={sev.iconColor} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!n.read ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                        <span className="text-xs text-slate-500 whitespace-nowrap">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                    <span className={`badge mt-2 text-[10px] ${sev.color}`}>{n.severity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
