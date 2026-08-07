import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Card, Spinner, Badge } from '../../components/common';
import {
  Ticket, Users, Megaphone, Brain, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Map, Bell
} from 'lucide-react';
import { ticketService, profileService, campaignService, notificationService } from '../../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ROLE_CONFIGS = {
  'Admin': {
    stats: ['users', 'tickets', 'campaigns', 'ai'],
    widgets: ['systemHealth', 'recentActivity'],
  },
  'Service Agent': {
    stats: ['assignedTickets', 'openTickets'],
    widgets: ['recentTickets'],
  },
  'Marketing Manager': {
    stats: ['campaigns', 'segments'],
    widgets: ['campaignMetrics'],
  },
  'Sales Manager': {
    stats: ['tickets', 'campaigns'],
    widgets: ['analytics'],
  },
  'Customer': {
    stats: ['journeys', 'notifications'],
    widgets: ['myActivity'],
  },
};

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const DashboardPage = () => {
  const { user, getRole } = useAuth();
  const role = getRole();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const promises = [];
        if (['Admin', 'Service Agent', 'Sales Manager'].includes(role)) {
          promises.push(ticketService.getTickets({ limit: 5 }).then(r => ({ tickets: r.data })));
        }
        if (['Admin', 'Marketing Manager', 'Sales Manager'].includes(role)) {
          promises.push(campaignService.getCampaigns({ limit: 5 }).then(r => ({ campaigns: r.data })));
        }
        promises.push(notificationService.getNotifications({ limit: 5 }).then(r => ({ notifications: r.data })));

        const results = await Promise.allSettled(promises);
        const merged = results.reduce((acc, r) => r.status === 'fulfilled' ? { ...acc, ...r.value } : acc, {});
        setData(merged);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [role]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  const ticketData = data.tickets?.data?.data || [];
  const campaignData = data.campaigns?.data?.data || [];
  const notifData = data.notifications?.data?.data?.notifications || [];

  const ticketChartData = [
    { name: 'Open', value: ticketData.filter(t => t.status === 'Open').length, color: '#ef4444' },
    { name: 'In Progress', value: ticketData.filter(t => t.status === 'In Progress').length, color: '#f59e0b' },
    { name: 'Closed', value: ticketData.filter(t => t.status === 'Closed').length, color: '#10b981' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome Banner */}
      <div className="card border-indigo-500/20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand opacity-5" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.firstName}! 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening across your organization today.</p>
          <div className="mt-3">
            <span className="badge badge-brand">{role}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Admin', 'Service Agent', 'Sales Manager'].includes(role) && (
          <>
            <StatCard title="Total Tickets" value={data.tickets?.data?.pagination?.total || 0} icon={Ticket} color="red" />
            <StatCard title="Open Tickets" value={ticketData.filter(t => t.status === 'Open').length} icon={Clock} color="yellow" />
          </>
        )}
        {['Admin', 'Marketing Manager', 'Sales Manager'].includes(role) && (
          <>
            <StatCard title="Campaigns" value={data.campaigns?.data?.pagination?.total || 0} icon={Megaphone} color="indigo" />
            <StatCard title="Active Campaigns" value={campaignData.filter(c => c.status === 'Running').length} icon={TrendingUp} color="green" />
          </>
        )}
        {role === 'Customer' && (
          <>
            <StatCard title="Notifications" value={notifData.length} icon={Bell} color="blue" />
            <StatCard title="Unread" value={notifData.filter(n => !n.read).length} icon={AlertTriangle} color="yellow" />
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Overview Chart */}
        {['Admin', 'Service Agent', 'Sales Manager'].includes(role) && ticketData.length > 0 && (
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Ticket Status Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ticketChartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ticketChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Notifications */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell size={18} className="text-indigo-400" /> Recent Notifications
          </h3>
          {notifData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No notifications</p>
          ) : (
            <div className="space-y-3">
              {notifData.slice(0, 5).map(n => (
                <div key={n._id} className={`flex gap-3 p-3 rounded-lg ${!n.read ? 'bg-indigo-500/5 border border-indigo-500/20' : 'bg-slate-800/50'}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Tickets */}
        {['Admin', 'Service Agent', 'Sales Manager'].includes(role) && (
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Ticket size={18} className="text-red-400" /> Recent Tickets
            </h3>
            <div className="space-y-2">
              {ticketData.slice(0, 5).map(t => (
                <div key={t._id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{t.title}</p>
                    <p className="text-xs text-slate-400">{t.createdBy?.firstName} {t.createdBy?.lastName}</p>
                  </div>
                  <span className={`badge ${t.priority === 'Critical' ? 'badge-error' : t.priority === 'High' ? 'badge-warning' : 'badge-neutral'}`}>{t.priority}</span>
                  <span className={`badge ${t.status === 'Open' ? 'badge-error' : t.status === 'Closed' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span>
                </div>
              ))}
              {ticketData.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No tickets found</p>}
            </div>
          </Card>
        )}

        {/* Campaign Status */}
        {['Admin', 'Marketing Manager', 'Sales Manager'].includes(role) && campaignData.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Megaphone size={18} className="text-indigo-400" /> Campaign Status
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={[
                  { name: 'Draft', value: campaignData.filter(c => c.status === 'Draft').length + 1 },
                  { name: 'Scheduled', value: campaignData.filter(c => c.status === 'Scheduled').length + 1 },
                  { name: 'Running', value: campaignData.filter(c => c.status === 'Running').length + 1 },
                  { name: 'Completed', value: campaignData.filter(c => c.status === 'Completed').length + 1 },
                ]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
