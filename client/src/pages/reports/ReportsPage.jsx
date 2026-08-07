import { useState, useEffect } from 'react';
import { reportService } from '../../services';
import { Card, PageHeader, Spinner, AnimatedPage } from '../../components/common';
import { BarChart2, TrendingUp, Ticket, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Badge } from '../../components/common';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const ReportsPage = () => {
  const [data, setData] = useState({ journey: null, campaign: null, tickets: null, ai: null });
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('journey');

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [j, c, t, a] = await Promise.allSettled([
          reportService.getJourneyReport(),
          reportService.getCampaignReport(),
          reportService.getTicketReport(),
          reportService.getAIReport(),
        ]);
        setData({
          journey: j.status === 'fulfilled' ? j.value.data.data : null,
          campaign: c.status === 'fulfilled' ? c.value.data.data : null,
          tickets: t.status === 'fulfilled' ? t.value.data.data : null,
          ai: a.status === 'fulfilled' ? a.value.data.data : null,
        });
      } catch { toast.error('Failed to load reports'); }
      finally { setLoading(false); }
    };
    loadAll();
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const TABS = [
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'campaign', label: 'Campaigns', icon: BarChart2 },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'ai', label: 'AI Usage', icon: Brain },
  ];

  return (
    <AnimatedPage className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Data insights across your organization" />

      {/* Tab Nav */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit flex-wrap border border-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveReport(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeReport === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'}`}>
            <t.icon size={16} />{t.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeReport}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-2"
      >
        {/* Journey Report */}
        {activeReport === 'journey' && data.journey && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-foreground mb-6">Journey Stage Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.journey.stageBreakdown || []} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis dataKey="_id" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'currentColor', opacity: 0.05 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3 className="font-semibold text-foreground mb-6">Enrollment Status</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.journey.enrollmentStatus || [{ _id: 'No data', value: 1 }]} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={2}>
                    {(data.journey.enrollmentStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Campaign Report */}
        {activeReport === 'campaign' && data.campaign && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-foreground mb-6">Campaign Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.campaign.statusBreakdown || [{ _id: 'No data', count: 1 }]} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={2}>
                    {(data.campaign.statusBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3 className="font-semibold text-foreground mb-6">Channel Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.campaign.channelBreakdown || []} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis dataKey="_id" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'currentColor', opacity: 0.05 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Ticket Report */}
        {activeReport === 'tickets' && data.tickets && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-foreground mb-6">Ticket Status</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.tickets.statusBreakdown || []} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis dataKey="_id" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'currentColor', opacity: 0.05 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3 className="font-semibold text-foreground mb-6">Priority Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.tickets.priorityBreakdown || [{ _id: 'None', count: 1 }]} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={2}>
                    {(data.tickets.priorityBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* AI Report */}
        {activeReport === 'ai' && data.ai && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-foreground mb-6">AI Feature Usage</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.ai.featureBreakdown || []} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                    <XAxis dataKey="_id" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'currentColor', opacity: 0.05 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#a855f7" name="Total Runs" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <h3 className="font-semibold text-foreground mb-6">Run Status Breakdown</h3>
                <div className="space-y-4">
                  {(data.ai.statusBreakdown || []).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-foreground font-medium capitalize">{s._id}</span>
                      <Badge label={s.count.toString()} variant={s._id === 'success' ? 'success' : 'error'} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <Card className="p-0 overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold text-foreground">Avg Confidence & Latency by Feature</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="py-3 px-6 font-medium">Feature</th>
                      <th className="py-3 px-6 font-medium">Runs</th>
                      <th className="py-3 px-6 font-medium">Avg Confidence</th>
                      <th className="py-3 px-6 font-medium">Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {(data.ai.featureBreakdown || []).map(f => (
                      <tr key={f._id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6 capitalize text-foreground font-medium">{f._id}</td>
                        <td className="py-4 px-6 text-muted-foreground">{f.count}</td>
                        <td className="py-4 px-6 text-emerald-500 font-medium">{Math.round((f.avgConfidence || 0) * 100)}%</td>
                        <td className="py-4 px-6 text-muted-foreground">{Math.round(f.avgLatency || 0)}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </AnimatedPage>
  );
};

export default ReportsPage;
