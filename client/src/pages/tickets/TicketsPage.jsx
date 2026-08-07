import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, PageHeader, Button, Badge, EmptyState, Pagination, Card } from '../../components/common';
import { ticketService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Ticket, Plus, Search, Filter, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = { Open: 'error', Pending: 'warning', 'In Progress': 'info', Escalated: 'error', Closed: 'success' };
const PRIORITY_COLORS = { Low: 'neutral', Medium: 'info', High: 'warning', Critical: 'error' };

const TicketsPage = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Medium', profileId: '' });
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketService.getTickets({ page, limit: 15, search, status: statusFilter });
      setTickets(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, [page, statusFilter]);
  useEffect(() => { const t = setTimeout(fetchTickets, 400); return () => clearTimeout(t); }, [search]);

  const createTicket = async () => {
    if (!newTicket.title || !newTicket.description) { toast.error('Title and description are required'); return; }
    setCreating(true);
    try {
      await ticketService.createTicket(newTicket);
      toast.success('Ticket created successfully');
      setShowCreate(false);
      setNewTicket({ title: '', description: '', priority: 'Medium', profileId: '' });
      fetchTickets();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create ticket'); }
    finally { setCreating(false); }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Service Tickets"
        subtitle="Manage and track all customer support requests"
        actions={
          <Button icon={Plus} onClick={() => setShowCreate(true)}>New Ticket</Button>
        }
      />

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-auto">
            <option value="">All Status</option>
            {['Open', 'Pending', 'In Progress', 'Escalated', 'Closed'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {/* Ticket List */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : tickets.length === 0 ? (
          <EmptyState icon={Ticket} title="No tickets found" description="No tickets match your current filters" />
        ) : (
          <div className="space-y-2">
            {tickets.map(ticket => (
              <div
                key={ticket._id}
                onClick={() => navigate(`/tickets/${ticket._id}`)}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500/30 border border-transparent transition-all duration-200 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 font-mono">#{ticket._id.slice(-6).toUpperCase()}</span>
                    <Badge label={ticket.priority} variant={PRIORITY_COLORS[ticket.priority]} />
                  </div>
                  <p className="text-white font-medium truncate">{ticket.title}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <User size={12} /> {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Badge label={ticket.status} variant={STATUS_COLORS[ticket.status]} />
              </div>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onChange={setPage} />
      </Card>

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg card border-slate-600 shadow-2xl animate-fade-in space-y-4">
            <h2 className="text-xl font-bold text-white">Create New Ticket</h2>
            <div>
              <label className="form-label">Title *</label>
              <input type="text" placeholder="Brief description of the issue" value={newTicket.title} onChange={e => setNewTicket(t => ({ ...t, title: e.target.value }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Description *</label>
              <textarea rows={4} placeholder="Provide detailed information..." value={newTicket.description} onChange={e => setNewTicket(t => ({ ...t, description: e.target.value }))} className="form-input resize-none" />
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select value={newTicket.priority} onChange={e => setNewTicket(t => ({ ...t, priority: e.target.value }))} className="form-input">
                {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setShowCreate(false)} variant="ghost" className="flex-1">Cancel</Button>
              <Button onClick={createTicket} loading={creating} className="flex-1">Create Ticket</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
