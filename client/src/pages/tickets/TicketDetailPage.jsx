import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService, aiService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Spinner, AIResultCard } from '../../components/common';
import { ArrowLeft, Send, Zap, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = { Open: 'error', Pending: 'warning', 'In Progress': 'info', Escalated: 'error', Closed: 'success' };
const PRIORITY_COLORS = { Low: 'neutral', Medium: 'info', High: 'warning', Critical: 'error' };

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiDraft, setAiDraft] = useState(null);
  const [aiLoading, setAiLoading] = useState({ summary: false, draft: false });
  const messagesEndRef = useRef(null);

  const fetchAll = async () => {
    try {
      const [ticketRes, msgRes] = await Promise.all([
        ticketService.getTicketById(id),
        ticketService.getMessages(id),
      ]);
      setTicket(ticketRes.data.data);
      setMessages(msgRes.data.data);
    } catch { toast.error('Failed to load ticket'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await ticketService.reply(id, reply);
      setReply('');
      toast.success('Reply sent');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send reply'); }
    finally { setSending(false); }
  };

  const getSummary = async () => {
    setAiLoading(l => ({ ...l, summary: true }));
    try {
      const res = await aiService.summarize(id);
      setAiSummary(res.data.data);
    } catch { toast.error('AI summarization failed'); }
    finally { setAiLoading(l => ({ ...l, summary: false })); }
  };

  const getDraft = async () => {
    setAiLoading(l => ({ ...l, draft: true }));
    try {
      const res = await aiService.draftReply(id);
      setAiDraft(res.data.data);
      if (res.data.data?.result) setReply(res.data.data.result);
    } catch { toast.error('AI draft failed'); }
    finally { setAiLoading(l => ({ ...l, draft: false })); }
  };

  const changeStatus = async (action) => {
    try {
      await (action === 'escalate' ? ticketService.escalate(id) : ticketService.close(id));
      toast.success(`Ticket ${action === 'escalate' ? 'escalated' : 'closed'}`);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!ticket) return <div className="text-center py-24 text-slate-400">Ticket not found</div>;

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tickets')} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 font-mono">#{ticket._id.slice(-6).toUpperCase()}</span>
            <Badge label={ticket.priority} variant={PRIORITY_COLORS[ticket.priority]} />
            <Badge label={ticket.status} variant={STATUS_COLORS[ticket.status]} />
          </div>
          <h1 className="text-xl font-bold text-white">{ticket.title}</h1>
        </div>
        {hasRole('Service Agent', 'Admin') && ticket.status !== 'Closed' && (
          <div className="flex gap-2">
            {ticket.status !== 'Escalated' && (
              <Button variant="danger" size="sm" icon={AlertTriangle} onClick={() => changeStatus('escalate')}>Escalate</Button>
            )}
            <Button variant="success" size="sm" icon={CheckCircle} onClick={() => changeStatus('close')}>Close</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="font-semibold text-white mb-1">Description</h3>
            <p className="text-slate-300 text-sm">{ticket.description}</p>
          </Card>

          <Card>
            <h3 className="font-semibold text-white mb-4">Conversation ({messages.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {messages.map(msg => (
                <div key={msg._id} className={`flex gap-3 ${msg.aiDraft ? 'opacity-90' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-bold flex-shrink-0">
                    {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
                  </div>
                  <div className={`flex-1 rounded-xl p-3 ${msg.aiDraft ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-slate-800'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-white">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                      {msg.aiDraft && <span className="badge badge-purple text-[10px]">AI Draft</span>}
                      <span className="text-xs text-slate-500 ml-auto">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-slate-300">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {ticket.status !== 'Closed' && (
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                <textarea
                  rows={3}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="form-input resize-none"
                />
                <div className="flex gap-2">
                  {hasRole('Service Agent', 'Admin') && (
                    <Button variant="ghost" size="sm" icon={Brain} loading={aiLoading.draft} onClick={getDraft}>AI Draft</Button>
                  )}
                  <Button icon={Send} loading={sending} onClick={sendReply} className="ml-auto">Send Reply</Button>
                </div>
              </div>
            )}
          </Card>

          {/* AI Draft Result */}
          {aiDraft && <AIResultCard result={aiDraft} icon={Brain} />}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-white mb-3">Ticket Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Created by</span><span className="text-white">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Assigned to</span><span className="text-white">{ticket.assignedAgent ? `${ticket.assignedAgent.firstName} ${ticket.assignedAgent.lastName}` : 'Unassigned'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Created</span><span className="text-slate-300">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span></div>
            </div>
          </Card>

          {/* AI Actions */}
          {hasRole('Service Agent', 'Admin') && (
            <Card className="border-purple-500/20">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Zap size={16} className="text-purple-400" />AI Assistance</h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" loading={aiLoading.summary} onClick={getSummary} className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10">
                  Summarize Conversation
                </Button>
              </div>
              {aiSummary && (
                <div className="mt-4">
                  <AIResultCard result={aiSummary} icon={Brain} />
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
