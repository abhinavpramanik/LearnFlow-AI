import { useState, useEffect } from 'react';
import { campaignService, segmentService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState, Pagination, Modal } from '../../components/common';
import { Megaphone, Plus, Search, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = { Draft: 'neutral', Scheduled: 'info', Running: 'success', Completed: 'brand', Cancelled: 'error' };

const CampaignsPage = () => {
  const [tab, setTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', segmentId: '', channels: [], message: '', frequency: 'Once' });
  const [segPagination, setSegPagination] = useState({});
  const [showCreateSeg, setShowCreateSeg] = useState(false);
  const [segForm, setSegForm] = useState({ name: '', description: '' });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await campaignService.getCampaigns({ page, limit: 10, search });
      setCampaigns(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load campaigns'); }
    finally { setLoading(false); }
  };

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const res = await segmentService.getSegments({ page, limit: 10 });
      setSegments(res.data.data);
      setSegPagination(res.data.pagination);
    } catch { toast.error('Failed to load segments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { tab === 'campaigns' ? fetchCampaigns() : fetchSegments(); }, [tab, page]);
  useEffect(() => { const t = setTimeout(fetchCampaigns, 400); return () => clearTimeout(t); }, [search]);

  const createCampaign = async () => {
    if (!form.name || !form.segmentId) { toast.error('Name and segment are required'); return; }
    setCreating(true);
    try {
      await campaignService.createCampaign(form);
      toast.success('Campaign created');
      setShowCreate(false);
      setForm({ name: '', description: '', segmentId: '', channels: [], message: '', frequency: 'Once' });
      fetchCampaigns();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create campaign'); }
    finally { setCreating(false); }
  };

  const publishCampaign = async (id) => {
    try {
      await campaignService.publish(id);
      toast.success('Campaign published');
      fetchCampaigns();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to publish'); }
  };

  const createSegment = async () => {
    if (!segForm.name) { toast.error('Name is required'); return; }
    try {
      await segmentService.createSegment(segForm);
      toast.success('Segment created');
      setShowCreateSeg(false);
      fetchSegments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleChannel = (ch) => setForm(f => ({ ...f, channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch] }));

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Campaigns & Segments"
        subtitle="Build targeted outreach campaigns for your learners"
        actions={
          <Button icon={Plus} onClick={() => tab === 'campaigns' ? setShowCreate(true) : setShowCreateSeg(true)}>
            New {tab === 'campaigns' ? 'Campaign' : 'Segment'}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl w-fit">
        {['campaigns', 'segments'].map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t === 'campaigns' ? <><Megaphone size={14} className="inline mr-1.5" />Campaigns</> : <><Layers size={14} className="inline mr-1.5" />Segments</>}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <>
          <Card>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
          </Card>
          <Card>
            {loading ? <div className="flex justify-center py-12"><Spinner /></div> : campaigns.length === 0 ? (
              <EmptyState icon={Megaphone} title="No campaigns yet" description="Create your first campaign to reach learners" />
            ) : (
              <div className="space-y-3">
                {campaigns.map(c => (
                  <div key={c._id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Segment: {c.segmentId?.name} · {c.frequency} · {c.channels?.join(', ')}</p>
                    </div>
                    <Badge label={c.status} variant={STATUS_COLORS[c.status]} />
                    {c.status === 'Draft' && (
                      <Button size="sm" onClick={() => publishCampaign(c._id)}>Publish</Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Pagination pagination={pagination} onChange={setPage} />
          </Card>
        </>
      )}

      {tab === 'segments' && (
        <Card>
          {loading ? <div className="flex justify-center py-12"><Spinner /></div> : segments.length === 0 ? (
            <EmptyState icon={Layers} title="No segments yet" description="Create segments to target specific learner groups" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {segments.map(s => (
                <div key={s._id} className="card border-slate-600 card-hover">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10"><Layers size={18} className="text-indigo-400" /></div>
                    <span className="badge badge-brand">{s.audienceCount || 0} members</span>
                  </div>
                  <h4 className="font-semibold text-white">{s.name}</h4>
                  <p className="text-slate-400 text-xs mt-1">{s.description || 'No description'}</p>
                </div>
              ))}
            </div>
          )}
          <Pagination pagination={segPagination} onChange={setPage} />
        </Card>
      )}

      {/* Create Campaign Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Campaign" size="lg">
        <div className="space-y-4">
          <div><label className="form-label">Campaign Name *</label><input type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="form-label">Target Segment *</label>
            <select className="form-input" value={form.segmentId} onChange={e => setForm(f => ({ ...f, segmentId: e.target.value }))}>
              <option value="">Select segment...</option>
              {segments.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="form-label">Channels</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {['Email', 'SMS', 'Push', 'In-App'].map(ch => (
                <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.channels.includes(ch) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <div><label className="form-label">Frequency</label>
            <select className="form-input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
              {['Once', 'Daily', 'Weekly', 'Monthly'].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div><label className="form-label">Message</label><textarea rows={3} className="form-input resize-none" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button loading={creating} onClick={createCampaign} className="flex-1">Create Campaign</Button>
          </div>
        </div>
      </Modal>

      {/* Create Segment Modal */}
      <Modal isOpen={showCreateSeg} onClose={() => setShowCreateSeg(false)} title="Create Segment">
        <div className="space-y-4">
          <div><label className="form-label">Segment Name *</label><input type="text" className="form-input" value={segForm.name} onChange={e => setSegForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="form-label">Description</label><textarea rows={3} className="form-input resize-none" value={segForm.description} onChange={e => setSegForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowCreateSeg(false)} className="flex-1">Cancel</Button>
            <Button onClick={createSegment} className="flex-1">Create Segment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CampaignsPage;
