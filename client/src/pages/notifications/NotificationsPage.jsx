import { useState, useEffect } from 'react';
import { notificationService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState, AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/common';
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const SEV_CONFIG = {
  Info: { icon: Info, color: 'neutral', iconColor: 'text-blue-500', bg: 'bg-blue-500/10' },
  Warning: { icon: AlertTriangle, color: 'warning', iconColor: 'text-amber-500', bg: 'bg-amber-500/10' },
  Urgent: { icon: AlertCircle, color: 'error', iconColor: 'text-destructive', bg: 'bg-destructive/10' },
  System: { icon: Zap, color: 'neutral', iconColor: 'text-muted-foreground', bg: 'bg-muted' },
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
    <AnimatedPage className="space-y-6 max-w-3xl mx-auto pb-10">
      <PageHeader
        title={<div className="flex items-center gap-3">Notifications {unreadCount > 0 && <Badge label={`${unreadCount} new`} variant="brand" className="text-sm" />}</div>}
        subtitle="Stay updated with system alerts, AI completions, and assignments"
        actions={unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllRead}>Mark all read</Button>
        )}
      />

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit border border-border">
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'}`}>
            {f}
          </button>
        ))}
      </div>

      <Card>
        {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description={filter === 'unread' ? 'All caught up!' : 'No notifications yet'} />
        ) : (
          <AnimatedList className="space-y-3">
            {notifications.map(n => {
              const sev = SEV_CONFIG[n.severity] || SEV_CONFIG.Info;
              return (
                <AnimatedListItem key={n._id}
                  onClick={() => !n.read && markRead(n._id)}
                  className={`flex gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${!n.read ? `bg-card border-primary/30 shadow-sm ring-1 ring-primary/10` : 'border-transparent bg-muted/30 hover:bg-muted/60'}`}>
                  <div className={`p-2.5 rounded-xl flex-shrink-0 h-fit ${sev.bg}`}>
                    <sev.icon size={20} className={sev.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                      <p className={`text-base font-semibold truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0 sm:mt-1">
                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{n.body}</p>
                    <div className="mt-3">
                      <Badge label={n.severity} variant={sev.color} className="text-[10px] px-1.5 py-0" />
                    </div>
                  </div>
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        )}
      </Card>
    </AnimatedPage>
  );
};

export default NotificationsPage;
