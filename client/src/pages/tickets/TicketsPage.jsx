import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, PageHeader, Button, Badge, EmptyState, Pagination, Card, AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/common';
import { ticketService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Ticket, Plus, Search, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

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
    <AnimatedPage className="space-y-6">
      <PageHeader
        title="Service Tickets"
        subtitle="Manage and track all customer support requests"
        actions={
          <Button icon={Plus} onClick={() => setShowCreate(true)}>New Ticket</Button>
        }
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search tickets..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9" 
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Status</option>
            {['Open', 'Pending', 'In Progress', 'Escalated', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {/* Ticket List */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : tickets.length === 0 ? (
          <EmptyState icon={Ticket} title="No tickets found" description="No tickets match your current filters" />
        ) : (
          <AnimatedList className="space-y-3">
            {tickets.map(ticket => (
              <AnimatedListItem
                key={ticket._id}
                onClick={() => navigate(`/tickets/${ticket._id}`)}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-card border hover:border-primary/50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs text-muted-foreground font-mono font-medium">#{ticket._id.slice(-6).toUpperCase()}</span>
                    <Badge label={ticket.priority} variant={PRIORITY_COLORS[ticket.priority]} />
                  </div>
                  <p className="text-foreground font-semibold truncate group-hover:text-primary transition-colors">{ticket.title}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <User size={14} className="text-muted-foreground" /> {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock size={14} className="text-muted-foreground" /> {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Badge label={ticket.status} variant={STATUS_COLORS[ticket.status]} className="shrink-0 self-start sm:self-center" />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
        <Pagination pagination={pagination} onChange={setPage} />
      </Card>

      {/* Create Ticket Modal using Shadcn Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input 
                placeholder="Brief description of the issue" 
                value={newTicket.title} 
                onChange={e => setNewTicket(t => ({ ...t, title: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <textarea 
                rows={4} 
                placeholder="Provide detailed information..." 
                value={newTicket.description} 
                onChange={e => setNewTicket(t => ({ ...t, description: e.target.value }))} 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" 
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select 
                value={newTicket.priority} 
                onChange={e => setNewTicket(t => ({ ...t, priority: e.target.value }))} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createTicket} loading={creating}>Create Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
};

export default TicketsPage;
