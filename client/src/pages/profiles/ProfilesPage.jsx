import { useState, useEffect } from 'react';
import { profileService, journeyService, aiService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState, Pagination, AIResultCard } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Map, Brain, User2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Customer Profiles" subtitle="Unified learner profiles across the organization" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search profiles..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
          </Card>
          <Card>
            {loading ? <div className="flex justify-center py-12"><Spinner /></div> : profiles.length === 0 ? (
              <EmptyState icon={Users} title="No profiles found" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profiles.map(p => (
                  <div key={p._id} onClick={() => selectProfile(p)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selected?._id === p._id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {p.userId?.firstName?.[0]}{p.userId?.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{p.userId?.firstName} {p.userId?.lastName}</p>
                        <p className="text-xs text-slate-400 truncate">{p.userId?.email}</p>
                        {p.department && <p className="text-xs text-slate-500">{p.department} · {p.designation}</p>}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="badge badge-neutral text-[10px]">{p.skills?.length || 0} skills</span>
                      <span className="badge badge-success text-[10px]">{p.certifications?.length || 0} certs</span>
                      {p.consent?.marketing && <span className="badge badge-brand text-[10px]">Marketing OK</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination pagination={pagination} onChange={setPage} />
          </Card>
        </div>

        {/* Profile Detail */}
        <div className="space-y-4">
          {selected ? (
            <>
              <Card>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xl">
                    {selected.userId?.firstName?.[0]}{selected.userId?.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selected.userId?.firstName} {selected.userId?.lastName}</h3>
                    <p className="text-sm text-slate-400">{selected.userId?.email}</p>
                    {selected.designation && <p className="text-xs text-slate-500 mt-1">{selected.designation} · {selected.department}</p>}
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Churn Risk</span><span className={`font-semibold ${(selected.riskScore?.churn || 0) > 0.7 ? 'text-red-400' : 'text-green-400'}`}>{Math.round((selected.riskScore?.churn || 0) * 100)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Marketing Consent</span><Badge label={selected.consent?.marketing ? 'Yes' : 'No'} variant={selected.consent?.marketing ? 'success' : 'error'} /></div>
                  <div className="flex justify-between"><span className="text-slate-400">AI Consent</span><Badge label={selected.consent?.aiRecommendations ? 'Yes' : 'No'} variant={selected.consent?.aiRecommendations ? 'success' : 'error'} /></div>
                </div>
              </Card>

              {/* Journey Timeline */}
              <Card>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Map size={16} className="text-indigo-400" /> Journey</h3>
                {journeys.length === 0 ? <p className="text-slate-500 text-sm">No journey events</p> : (
                  <div className="space-y-2">
                    {journeys.slice(0, 5).map(j => (
                      <div key={j._id} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                        <span className="text-white">{j.stage}</span>
                        <Badge label={j.status} variant={j.status === 'Completed' ? 'success' : j.status === 'Active' ? 'info' : 'neutral'} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* AI Recommendation */}
              {hasRole('Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin') && (
                <Card className="border-purple-500/20">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Brain size={16} className="text-purple-400" /> AI Next Best Action</h3>
                  <Button variant="ghost" size="sm" loading={aiLoading} onClick={getNextBestAction} className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10 mb-3">
                    Get Recommendation
                  </Button>
                  {aiRec && <AIResultCard result={aiRec} icon={Brain} />}
                </Card>
              )}
            </>
          ) : (
            <Card>
              <EmptyState icon={User2} title="Select a profile" description="Click on a profile to view details" />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilesPage;
