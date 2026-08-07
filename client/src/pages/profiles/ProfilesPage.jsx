import { useState, useEffect } from 'react';
import { profileService, journeyService, aiService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState, Pagination, AIResultCard, AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Map, Brain, User2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { motion } from 'framer-motion';

const ProfilesPage = () => {
  const { hasRole } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [aiRec, setAiRec] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfiles({ page, limit: 12, search });
      setProfiles(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load profiles'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfiles(); }, [page]);
  useEffect(() => { const t = setTimeout(fetchProfiles, 400); return () => clearTimeout(t); }, [search]);

  const selectProfile = async (profile) => {
    setSelected(profile);
    setAiRec(null);
    try {
      const res = await journeyService.getJourneys(profile._id, { limit: 10 });
      setJourneys(res.data.data);
    } catch { setJourneys([]); }
  };

  const getNextBestAction = async () => {
    if (!selected) return;
    setAiLoading(true);
    try {
      const res = await aiService.nextBestAction(selected._id);
      setAiRec(res.data.data);
    } catch { toast.error('AI recommendation failed'); }
    finally { setAiLoading(false); }
  };

  return (
    <AnimatedPage className="space-y-6">
      <PageHeader title="Customer Profiles" subtitle="Unified learner profiles across the organization" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search profiles..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-9" 
              />
            </div>
          </Card>
          <Card>
            {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : profiles.length === 0 ? (
              <EmptyState icon={Users} title="No profiles found" />
            ) : (
              <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profiles.map(p => (
                  <AnimatedListItem 
                    key={p._id} 
                    onClick={() => selectProfile(p)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${selected?._id === p._id ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/15 text-primary font-bold">
                          {p.userId?.firstName?.[0]}{p.userId?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate transition-colors ${selected?._id === p._id ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                          {p.userId?.firstName} {p.userId?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{p.userId?.email}</p>
                        {p.department && <p className="text-[11px] text-muted-foreground mt-0.5">{p.department} · {p.designation}</p>}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <Badge label={`${p.skills?.length || 0} skills`} variant="neutral" />
                      <Badge label={`${p.certifications?.length || 0} certs`} variant="success" />
                      {p.consent?.marketing && <Badge label="Marketing OK" variant="brand" />}
                    </div>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            )}
            <Pagination pagination={pagination} onChange={setPage} />
          </Card>
        </div>

        {/* Profile Detail */}
        <div className="space-y-6">
          {selected ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
              <Card>
                <div className="flex flex-col items-center text-center gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                      {selected.userId?.firstName?.[0]}{selected.userId?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">{selected.userId?.firstName} {selected.userId?.lastName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selected.userId?.email}</p>
                    {selected.designation && <p className="text-sm text-muted-foreground mt-1 bg-muted px-3 py-1 rounded-full inline-block">{selected.designation} · {selected.department}</p>}
                  </div>
                </div>
                <div className="mt-6 space-y-3 text-sm pt-6 border-t border-border">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Churn Risk</span><span className={`font-semibold ${(selected.riskScore?.churn || 0) > 0.7 ? 'text-destructive' : 'text-emerald-500'}`}>{Math.round((selected.riskScore?.churn || 0) * 100)}%</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Marketing Consent</span><Badge label={selected.consent?.marketing ? 'Yes' : 'No'} variant={selected.consent?.marketing ? 'success' : 'error'} /></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">AI Consent</span><Badge label={selected.consent?.aiRecommendations ? 'Yes' : 'No'} variant={selected.consent?.aiRecommendations ? 'success' : 'error'} /></div>
                </div>
              </Card>

              {/* Journey Timeline */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Map size={18} className="text-primary" /> Journey Snapshot</h3>
                {journeys.length === 0 ? <p className="text-muted-foreground text-sm py-4">No journey events recorded</p> : (
                  <div className="space-y-3 pl-2 border-l-2 border-border ml-2">
                    {journeys.slice(0, 5).map(j => (
                      <div key={j._id} className="relative pl-4 py-2">
                        <div className={`absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${j.status === 'Completed' ? 'bg-emerald-500' : j.status === 'Active' ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">{j.stage}</span>
                          <Badge label={j.status} variant={j.status === 'Completed' ? 'success' : j.status === 'Active' ? 'info' : 'neutral'} className="text-[10px] px-1.5 py-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* AI Recommendation */}
              {hasRole('Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin') && (
                <Card className="border-purple-500/30 bg-purple-500/5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Brain size={18} className="text-purple-500" /> AI Next Best Action</h3>
                  <Button variant="outline" size="md" loading={aiLoading} onClick={getNextBestAction} className="w-full border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700 mb-4">
                    Get Recommendation
                  </Button>
                  {aiRec && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <AIResultCard result={aiRec} icon={Brain} />
                    </motion.div>
                  )}
                </Card>
              )}
            </motion.div>
          ) : (
            <Card className="h-[400px] flex items-center justify-center bg-muted/20 border-dashed border-2">
              <EmptyState icon={User2} title="Select a profile" description="Click on a profile to view details" />
            </Card>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ProfilesPage;
