import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService, aiService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Spinner, AIResultCard, AnimatedPage } from '../../components/common';
import { ArrowLeft, Send, Zap, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { motion } from 'framer-motion';

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
  if (!ticket) return <div className="text-center py-24 text-muted-foreground">Ticket not found</div>;

  return (
    <AnimatedPage className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')} className="w-10 h-10 p-0 rounded-full shrink-0">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-muted-foreground font-mono font-medium">#{ticket._id.slice(-6).toUpperCase()}</span>
            <Badge label={ticket.priority} variant={PRIORITY_COLORS[ticket.priority]} />
            <Badge label={ticket.status} variant={STATUS_COLORS[ticket.status]} />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{ticket.title}</h1>
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
          <Card className="bg-muted/30">
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{ticket.description}</p>
          </Card>

          <Card>
            <h3 className="font-semibold text-foreground mb-4 border-b pb-4">Conversation ({messages.length})</h3>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={msg._id} 
                  className={`flex gap-4 ${msg.aiDraft ? 'opacity-90' : ''}`}
                >
                  <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 rounded-2xl p-4 ${msg.aiDraft ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-muted/50 border border-border'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-foreground">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                      {msg.aiDraft && <Badge label="AI Draft" variant="purple" className="text-[10px] px-1.5 py-0" />}
                      <span className="text-xs text-muted-foreground ml-auto">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {ticket.status !== 'Closed' && (
              <div className="mt-6 pt-6 border-t border-border space-y-4 bg-card">
                <textarea
                  rows={4}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your reply here..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  {hasRole('Service Agent', 'Admin') && (
                    <Button variant="outline" size="md" icon={Brain} loading={aiLoading.draft} onClick={getDraft} className="w-full sm:w-auto text-purple-500 border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-600">
                      Generate AI Draft
                    </Button>
                  )}
                  <Button icon={Send} loading={sending} onClick={sendReply} className="w-full sm:w-auto sm:ml-auto">Send Reply</Button>
                </div>
              </div>
            )}
          </Card>

          {/* AI Draft Result */}
          {aiDraft && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <AIResultCard result={aiDraft} icon={Brain} />
            </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-foreground mb-4">Ticket Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-border/50"><span className="text-muted-foreground">Created by</span><span className="text-foreground font-medium">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</span></div>
              <div className="flex justify-between items-center py-1 border-b border-border/50"><span className="text-muted-foreground">Assigned to</span><span className="text-foreground font-medium">{ticket.assignedAgent ? `${ticket.assignedAgent.firstName} ${ticket.assignedAgent.lastName}` : 'Unassigned'}</span></div>
              <div className="flex justify-between items-center py-1 border-b border-border/50"><span className="text-muted-foreground">Created</span><span className="text-foreground font-medium">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span></div>
            </div>
          </Card>

          {/* AI Actions */}
          {hasRole('Service Agent', 'Admin') && (
            <Card className="border-purple-500/30 bg-purple-500/5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Zap size={18} className="text-purple-500 fill-purple-500/20" />AI Assistance</h3>
              <div className="space-y-3">
                <Button variant="outline" size="md" loading={aiLoading.summary} onClick={getSummary} className="w-full border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700">
                  Summarize Conversation
                </Button>
              </div>
              {aiSummary && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                  <AIResultCard result={aiSummary} icon={Brain} />
                </motion.div>
              )}
            </Card>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default TicketDetailPage;
