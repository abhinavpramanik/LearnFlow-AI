import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Card, Spinner, Badge, AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/common';
import {
  Ticket, Users, Megaphone, Brain, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Map, Bell
} from 'lucide-react';
import { ticketService, profileService, campaignService, notificationService } from '../../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ROLE_CONFIGS = {
  'Admin': { stats: ['users', 'tickets', 'campaigns', 'ai'], widgets: ['systemHealth', 'recentActivity'] },
  'Service Agent': { stats: ['assignedTickets', 'openTickets'], widgets: ['recentTickets'] },
  'Marketing Manager': { stats: ['campaigns', 'segments'], widgets: ['campaignMetrics'] },
  'Sales Manager': { stats: ['tickets', 'campaigns'], widgets: ['analytics'] },
  'Customer': { stats: ['journeys', 'notifications'], widgets: ['myActivity'] },
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
    <AnimatedPage className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10 p-6 sm:p-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Here's what's happening across your organization today.</p>
          <div className="mt-4">
            <Badge label={role} variant="brand" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Admin', 'Service Agent', 'Sales Manager'].includes(role) && (
          <>
            <AnimatedListItem>
              <StatCard title="Total Tickets" value={data.tickets?.data?.pagination?.total || 0} icon={Ticket} color="red" />
            </AnimatedListItem>
            <AnimatedListItem>
              <StatCard title="Open Tickets" value={ticketData.filter(t => t.status === 'Open').length} icon={Clock} color="yellow" />
            </AnimatedListItem>
          </>
        )}
        {['Admin', 'Marketing Manager', 'Sales Manager'].includes(role) && (
          <>
            <AnimatedListItem>
              <StatCard title="Campaigns" value={data.campaigns?.data?.pagination?.total || 0} icon={Megaphone} color="indigo" />
            </AnimatedListItem>
            <AnimatedListItem>
              <StatCard title="Active Campaigns" value={campaignData.filter(c => c.status === 'Running').length} icon={TrendingUp} color="green" />
            </AnimatedListItem>
          </>
        )}
        {role === 'Customer' && (
          <>
            <AnimatedListItem>
              <StatCard title="Notifications" value={notifData.length} icon={Bell} color="blue" />
            </AnimatedListItem>
            <AnimatedListItem>
              <StatCard title="Unread" value={notifData.filter(n => !n.read).length} icon={AlertTriangle} color="yellow" />
            </AnimatedListItem>
          </>
        )}
      </AnimatedList>

      {/* Main Grid */}
      <AnimatedList className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Overview Chart */}
        {['Admin', 'Service Agent', 'Sales Manager'].includes(role) && ticketData.length > 0 && (
          <AnimatedListItem className="lg:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-6 tracking-tight">Ticket Status Overview</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ticketChartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'currentColor', opacity: 0.05 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {ticketChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </AnimatedListItem>
        )}

        {/* Notifications */}
        <AnimatedListItem>
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 tracking-tight">
              <Bell size={18} className="text-primary" /> Recent Notifications
            </h3>
            {notifData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No new notifications</p>
            ) : (
              <div className="space-y-4">
                {notifData.slice(0, 5).map(n => (
                  <div key={n._id} className={`flex gap-3 p-3 rounded-xl transition-colors ${!n.read ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </AnimatedListItem>

        {/* Recent Tickets */}
        {['Admin', 'Service Agent', 'Sales Manager'].includes(role) && (
          <AnimatedListItem className="lg:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 tracking-tight">
                <Ticket size={18} className="text-destructive" /> Recent Tickets
              </h3>
              <div className="space-y-3">
                {ticketData.slice(0, 5).map(t => (
                  <div key={t._id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.createdBy?.firstName} {t.createdBy?.lastName}</p>
                    </div>
                    <Badge label={t.priority} variant={t.priority === 'Critical' ? 'error' : t.priority === 'High' ? 'warning' : 'neutral'} />
                    <Badge label={t.status} variant={t.status === 'Open' ? 'error' : t.status === 'Closed' ? 'success' : 'warning'} />
                  </div>
                ))}
                {ticketData.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No tickets found</p>}
              </div>
            </Card>
          </AnimatedListItem>
        )}

        {/* Campaign Status */}
        {['Admin', 'Marketing Manager', 'Sales Manager'].includes(role) && campaignData.length > 0 && (
          <AnimatedListItem>
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 tracking-tight">
                <Megaphone size={18} className="text-primary" /> Campaign Status
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={[
                    { name: 'Draft', value: campaignData.filter(c => c.status === 'Draft').length + 1 },
                    { name: 'Scheduled', value: campaignData.filter(c => c.status === 'Scheduled').length + 1 },
                    { name: 'Running', value: campaignData.filter(c => c.status === 'Running').length + 1 },
                    { name: 'Completed', value: campaignData.filter(c => c.status === 'Completed').length + 1 },
                  ]} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={5}>
                    {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </AnimatedListItem>
        )}
      </AnimatedList>
    </AnimatedPage>
  );
};

export default DashboardPage;
