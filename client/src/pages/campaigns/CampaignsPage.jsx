import { useState, useEffect } from 'react';
import { campaignService, segmentService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState, Pagination, AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/common';
import { Megaphone, Plus, Search, Layers, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const STATUS_COLORS = { Draft: 'neutral', Scheduled: 'info', Running: 'success', Completed: 'brand', Cancelled: 'error' };

const CampaignsPage = () => {
  const [tab, setTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', segmentId: '', channels: [], message: '', frequency: 'Once' });
  
  const [showCreateSeg, setShowCreateSeg] = useState(false);
  const [segForm, setSegForm] = useState({ name: '', description: '' });
  const [segPagination, setSegPagination] = useState({});

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
    <AnimatedPage className="space-y-6">
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
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit border border-border">
        {['campaigns', 'segments'].map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'}`}>
            {t === 'campaigns' ? <><Megaphone size={16} className="inline mr-2 -mt-0.5" />Campaigns</> : <><Layers size={16} className="inline mr-2 -mt-0.5" />Segments</>}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="text" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </Card>
          <Card>
            {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : campaigns.length === 0 ? (
              <EmptyState icon={Megaphone} title="No campaigns yet" description="Create your first campaign to reach learners" />
            ) : (
              <AnimatedList className="space-y-3">
                {campaigns.map(c => (
                  <AnimatedListItem key={c._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors shadow-sm">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 hidden sm:block">
                      <Megaphone size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-lg mb-1">{c.name}</h4>
                      <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Layers size={14} /> {c.segmentId?.name || 'No Segment'}</span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {c.frequency}</span>
                        <span>&middot;</span>
                        <span className="font-medium text-foreground/80">{c.channels?.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0 justify-between sm:justify-end shrink-0">
                      <Badge label={c.status} variant={STATUS_COLORS[c.status]} />
                      {c.status === 'Draft' && (
                        <Button size="sm" variant="outline" onClick={() => publishCampaign(c._id)}>Publish</Button>
                      )}
                    </div>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            )}
            <Pagination pagination={pagination} onChange={setPage} />
          </Card>
        </div>
      )}

      {tab === 'segments' && (
        <Card>
          {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : segments.length === 0 ? (
            <EmptyState icon={Layers} title="No segments yet" description="Create segments to target specific learner groups" />
          ) : (
            <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {segments.map(s => (
                <AnimatedListItem key={s._id} className="p-5 rounded-xl border bg-card hover:border-primary/50 transition-colors shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Layers size={20} /></div>
                    <Badge label={`${s.audienceCount || 0} members`} variant="brand" className="text-xs py-0.5" />
                  </div>
                  <h4 className="font-bold text-foreground text-lg mb-1">{s.name}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.description || 'No description provided'}</p>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          )}
          <Pagination pagination={segPagination} onChange={setPage} />
        </Card>
      )}

      {/* Create Campaign Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Target Segment *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={form.segmentId} onChange={e => setForm(f => ({ ...f, segmentId: e.target.value }))}>
                <option value="">Select segment...</option>
                {segments.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="flex gap-2 flex-wrap pt-1">
                {['Email', 'SMS', 'Push', 'In-App'].map(ch => (
                  <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form.channels.includes(ch) ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'bg-background border-input text-foreground hover:bg-muted'}`}>
                    {ch}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                {['Once', 'Daily', 'Weekly', 'Monthly'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Message Content</Label>
              <textarea rows={4} className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button loading={creating} onClick={createCampaign}>Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Segment Modal */}
      <Dialog open={showCreateSeg} onOpenChange={setShowCreateSeg}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Segment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Segment Name *</Label>
              <Input type="text" value={segForm.name} onChange={e => setSegForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" value={segForm.description} onChange={e => setSegForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSeg(false)}>Cancel</Button>
            <Button onClick={createSegment}>Create Segment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
};

export default CampaignsPage;
