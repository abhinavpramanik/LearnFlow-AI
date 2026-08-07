import { useState, useEffect } from 'react';
import { journeyService, profileService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState, Modal } from '../../components/common';
import { Map, Plus, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

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
    <div className="animate-fade-in space-y-6">
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
        <h3 className="font-semibold text-white mb-4">Journey Progress</h3>
        <div className="flex gap-2 flex-wrap">
          {stages.map(stage => {
            const completed = journeys.some(j => j.stage === stage && j.status === 'Completed');
            const inProgress = journeys.some(j => j.stage === stage && j.status === 'Active');
            return (
              <div key={stage} className={`flex-1 min-w-24 p-3 rounded-lg text-center border text-xs font-medium transition-all
                ${completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  inProgress ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                  'bg-slate-800 border-slate-700 text-slate-500'}`}>
                <div className="mb-1">
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
        <EmptyState icon={Map} title="No journey events yet" description="Your learning journey events will appear here" />
      ) : (
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-700" />
          <div className="space-y-4">
            {journeys.map((event, i) => {
              const StatusIcon = STATUS_ICONS[event.status] || Clock;
              return (
                <div key={event._id} className="relative animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  {/* Dot */}
                  <div className={`absolute -left-8 w-7 h-7 rounded-full border-2 flex items-center justify-center
                    ${event.status === 'Completed' ? 'bg-emerald-500/20 border-emerald-500' :
                      event.status === 'Active' ? 'bg-indigo-500/20 border-indigo-500 animate-pulse-soft' :
                      'bg-slate-700 border-slate-600'}`}>
                    <StatusIcon size={14} className={event.status === 'Completed' ? 'text-emerald-400' : event.status === 'Active' ? 'text-indigo-400' : 'text-slate-500'} />
                  </div>
                  <Card className="card-hover">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge label={event.stage} variant={STAGE_COLORS[event.stage] || 'neutral'} />
                          <Badge label={event.status} variant={event.status === 'Completed' ? 'success' : event.status === 'Active' ? 'info' : 'neutral'} />
                        </div>
                        <h4 className="text-white font-semibold">{event.title}</h4>
                        {event.description && <p className="text-slate-400 text-sm mt-1">{event.description}</p>}
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Journey Event">
        <div className="space-y-4">
          <div>
            <label className="form-label">Stage</label>
            <select className="form-input" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
              {stages.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="form-label">Title *</label><input type="text" className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="form-label">Description</label><textarea rows={3} className="form-input resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['Active', 'Completed', 'On Hold', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button loading={creating} onClick={createEvent} className="flex-1">Add Event</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JourneyPage;
