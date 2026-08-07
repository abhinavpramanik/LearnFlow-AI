import { useState, useEffect } from 'react';
import { reportService } from '../../services';
import { Card, PageHeader, Spinner, StatCard } from '../../components/common';
import { BarChart2, TrendingUp, Ticket, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

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
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Data insights across your organization" />

      {/* Tab Nav */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveReport(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeReport === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* Journey Report */}
      {activeReport === 'journey' && data.journey && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-white mb-4">Journey Stage Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.journey.stageBreakdown || []} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="_id" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#6366f1" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3 className="font-semibold text-white mb-4">Enrollment Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.journey.enrollmentStatus || [{ _id: 'No data', value: 1 }]} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                    {(data.journey.enrollmentStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {/* Campaign Report */}
      {activeReport === 'campaign' && data.campaign && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-white mb-4">Campaign Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.campaign.statusBreakdown || [{ _id: 'No data', count: 1 }]} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {(data.campaign.statusBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 className="font-semibold text-white mb-4">Channel Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.campaign.channelBreakdown || []} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="_id" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Ticket Report */}
      {activeReport === 'tickets' && data.tickets && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-white mb-4">Ticket Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.tickets.statusBreakdown || []} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="_id" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 className="font-semibold text-white mb-4">Priority Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.tickets.priorityBreakdown || [{ _id: 'None', count: 1 }]} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {(data.tickets.priorityBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
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
              <h3 className="font-semibold text-white mb-4">AI Feature Usage</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.ai.featureBreakdown || []} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="_id" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#a855f7" name="Total Runs" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3 className="font-semibold text-white mb-4">Run Status Breakdown</h3>
              <div className="space-y-4 mt-6">
                {(data.ai.statusBreakdown || []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-slate-300 capitalize">{s._id}</span>
                    <span className={`badge ${s._id === 'success' ? 'badge-success' : 'badge-error'}`}>{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card>
            <h3 className="font-semibold text-white mb-4">Avg Confidence & Latency by Feature</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-slate-400"><th className="text-left py-2 px-4">Feature</th><th className="text-left py-2 px-4">Runs</th><th className="text-left py-2 px-4">Avg Confidence</th><th className="text-left py-2 px-4">Avg Latency</th></tr></thead>
                <tbody>{(data.ai.featureBreakdown || []).map(f => (
                  <tr key={f._id} className="border-t border-slate-700">
                    <td className="py-2 px-4 capitalize text-white">{f._id}</td>
                    <td className="py-2 px-4 text-slate-300">{f.count}</td>
                    <td className="py-2 px-4 text-emerald-400">{Math.round((f.avgConfidence || 0) * 100)}%</td>
                    <td className="py-2 px-4 text-slate-300">{Math.round(f.avgLatency || 0)}ms</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
