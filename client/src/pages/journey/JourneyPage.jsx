import { useState, useEffect } from 'react';
import { journeyService, profileService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState, Modal, AnimatedPage } from '../../components/common';
import { Map, Plus, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const STAGE_COLORS = {
  'Assessment': 'info', 'Learning Path': 'brand', 'Course': 'purple',
  'Practice': 'warning', 'Coaching': 'success', 'Certification': 'success', 'Workforce Planning': 'neutral'
};

const STATUS_ICONS = {
  Active: Clock, Completed: CheckCircle, 'On Hold': Clock, Cancelled: XCircle
};

const JourneyPage = () => {
  const { user, hasRole } = useAuth();
  const [myProfile, setMyProfile] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ stage: 'Assessment', title: '', description: '', status: 'Active' });

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch own profile first
        const profileRes = await profileService.getMyProfile();
        const profile = profileRes.data.data;
        setMyProfile(profile);
        const journeyRes = await journeyService.getJourneys(profile._id, { limit: 50 });
        setJourneys(journeyRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load journey data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const createEvent = async () => {
    if (!form.title || !myProfile) { toast.error('Title is required'); return; }
    setCreating(true);
    try {
      await journeyService.createJourney(myProfile._id, form);
      toast.success('Journey event added');
      setShowCreate(false);
      setForm({ stage: 'Assessment', title: '', description: '', status: 'Active' });
      const res = await journeyService.getJourneys(myProfile._id, { limit: 50 });
      setJourneys(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setCreating(false);
    }
  };

  const stages = ['Assessment', 'Learning Path', 'Course', 'Practice', 'Coaching', 'Certification', 'Workforce Planning'];

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <AnimatedPage className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="My Learning Journey"
        subtitle="Track your progress through the full learning lifecycle"
        actions={
          hasRole('Service Agent', 'Admin') && (
            <Button icon={Plus} onClick={() => setShowCreate(true)}>Add Event</Button>
          )
        }
      />

      {/* Progress Bar across stages */}
      <Card>
        <h3 className="font-semibold text-foreground mb-6">Journey Progress Snapshot</h3>
        <div className="flex gap-3 flex-wrap md:flex-nowrap">
          {stages.map(stage => {
            const completed = journeys.some(j => j.stage === stage && j.status === 'Completed');
            const inProgress = journeys.some(j => j.stage === stage && j.status === 'Active');
            return (
              <div key={stage} className={`flex-1 min-w-[100px] p-4 rounded-xl text-center border text-xs font-semibold transition-all duration-300
                ${completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm' :
                  inProgress ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' :
                  'bg-muted/50 border-border text-muted-foreground'}`}>
                <div className="mb-2 text-lg">
                  {completed ? '✅' : inProgress ? '🔄' : '⏳'}
                </div>
                {stage}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline */}
      {journeys.length === 0 ? (
        <Card className="py-12 bg-muted/20 border-dashed border-2">
          <EmptyState icon={Map} title="No journey events yet" description="Your learning journey events will appear here" />
        </Card>
      ) : (
        <div className="relative pl-8 sm:pl-12 py-4">
          {/* Vertical line */}
          <div className="absolute left-[15px] sm:left-[31px] top-4 bottom-4 w-0.5 bg-border rounded-full" />
          <div className="space-y-6">
            {journeys.map((event, i) => {
              const StatusIcon = STATUS_ICONS[event.status] || Clock;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                  key={event._id} 
                  className="relative"
                >
                  {/* Dot */}
                  <div className={`absolute -left-[35px] sm:-left-[51px] top-4 w-9 h-9 rounded-full border-2 flex items-center justify-center bg-background shadow-sm z-10
                    ${event.status === 'Completed' ? 'border-emerald-500' :
                      event.status === 'Active' ? 'border-primary' :
                      'border-border'}`}>
                    <StatusIcon size={16} className={event.status === 'Completed' ? 'text-emerald-500' : event.status === 'Active' ? 'text-primary' : 'text-muted-foreground'} />
                  </div>
                  <Card className="hover:border-primary/50 transition-colors bg-card/80 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge label={event.stage} variant={STAGE_COLORS[event.stage] || 'neutral'} />
                          <Badge label={event.status} variant={event.status === 'Completed' ? 'success' : event.status === 'Active' ? 'info' : 'neutral'} />
                        </div>
                        <h4 className="text-foreground font-semibold text-lg">{event.title}</h4>
                        {event.description && <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{event.description}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1.5 sm:mt-1 bg-muted px-2 py-1 rounded-md">
                        <Calendar size={12} />
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Journey Event">
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Stage</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
              {stages.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['Active', 'Completed', 'On Hold', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border mt-6">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button loading={creating} onClick={createEvent} className="flex-1">Add Event</Button>
          </div>
        </div>
      </Modal>
    </AnimatedPage>
  );
};

export default JourneyPage;
