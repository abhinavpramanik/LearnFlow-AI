import { useState, useEffect } from 'react';
import { aiService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, AIResultCard, EmptyState, Pagination } from '../../components/common';
import { Brain, Zap, MessageSquare, Lightbulb, Eye, CheckCircle, XCircle, Edit3, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const AI_FEATURES = [
  { id: 'intent', label: 'Intent Classification', icon: Lightbulb, desc: 'Classify customer message intent', color: 'text-amber-400' },
  { id: 'sentiment', label: 'Sentiment Analysis', icon: MessageSquare, desc: 'Analyze message sentiment', color: 'text-blue-400' },
  { id: 'summarize', label: 'Conversation Summary', icon: Edit3, desc: 'Summarize ticket conversation', color: 'text-purple-400' },
  { id: 'recommend', label: 'Next Best Action', icon: Zap, desc: 'Get AI recommendation for a profile', color: 'text-emerald-400' },
  { id: 'draft', label: 'Draft Reply', icon: Brain, desc: 'AI-draft a response for a ticket', color: 'text-indigo-400' },
];

const AICenterPage = () => {
  const [active, setActive] = useState('intent');
  const [input, setInput] = useState({ message: '', ticketId: '', profileId: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [runs, setRuns] = useState([]);
  const [tabSection, setTabSection] = useState('tools');

  useEffect(() => {
    const loadRecs = async () => {
      try {
        const res = await aiService.getRecommendations({ limit: 10 });
        setRecommendations(res.data.data || []);
      } catch {}
    };
    const loadRuns = async () => {
      try {
        const res = await aiService.getRuns({ limit: 20 });
        setRuns(res.data.data || []);
      } catch {}
    };
    loadRecs();
    loadRuns();
  }, []);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (active === 'intent') res = await aiService.classifyIntent({ message: input.message });
      else if (active === 'sentiment') res = await aiService.analyzeSentiment({ message: input.message });
      else if (active === 'summarize') res = await aiService.summarize(input.ticketId);
      else if (active === 'recommend') res = await aiService.nextBestAction(input.profileId);
      else if (active === 'draft') res = await aiService.draftReply(input.ticketId);
      setResult(res.data.data);
      toast.success('AI analysis complete');
    } catch (err) { toast.error(err.response?.data?.message || 'AI request failed'); }
    finally { setLoading(false); }
  };

  const reviewRecommendation = async (id, decision) => {
    try {
      await aiService.reviewRecommendation(id, decision, `Reviewed via AI Center`);
      toast.success(`Recommendation ${decision.toLowerCase()}`);
      const res = await aiService.getRecommendations({ limit: 10 });
      setRecommendations(res.data.data || []);
    } catch { toast.error('Review failed'); }
  };

  const activeFeature = AI_FEATURES.find(f => f.id === active);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="AI Center" subtitle="Powered by Google Gemini — all outputs require human review" />

      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl w-fit">
        {['tools', 'recommendations', 'runs'].map(s => (
          <button key={s} onClick={() => setTabSection(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tabSection === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      {tabSection === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feature Selector */}
          <div className="space-y-2">
            {AI_FEATURES.map(f => (
              <button key={f.id} onClick={() => { setActive(f.id); setResult(null); }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${active === f.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                <f.icon size={20} className={f.color} />
                <div>
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-slate-400">{f.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Input & Result */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-indigo-500/20">
              <div className="flex items-center gap-3 mb-4">
                {activeFeature && <activeFeature.icon size={20} className={activeFeature.color} />}
                <h3 className="font-semibold text-white">{activeFeature?.label}</h3>
                <span className="badge badge-purple text-xs ml-auto">Gemini 1.5 Flash</span>
              </div>
              <div className="space-y-3">
                {['intent', 'sentiment'].includes(active) && (
                  <div>
                    <label className="form-label">Customer Message</label>
                    <textarea rows={4} placeholder="Enter the customer message to analyze..." value={input.message} onChange={e => setInput(i => ({ ...i, message: e.target.value }))} className="form-input resize-none" />
                  </div>
                )}
                {['summarize', 'draft'].includes(active) && (
                  <div>
                    <label className="form-label">Ticket ID</label>
                    <input type="text" placeholder="Enter ticket MongoDB ID..." value={input.ticketId} onChange={e => setInput(i => ({ ...i, ticketId: e.target.value }))} className="form-input" />
                  </div>
                )}
                {active === 'recommend' && (
                  <div>
                    <label className="form-label">Profile ID</label>
                    <input type="text" placeholder="Enter profile MongoDB ID..." value={input.profileId} onChange={e => setInput(i => ({ ...i, profileId: e.target.value }))} className="form-input" />
                  </div>
                )}
                <Button loading={loading} onClick={run} icon={Zap} className="w-full">Run Analysis</Button>
              </div>
            </Card>

            {result && (
              <div className="animate-fade-in">
                <AIResultCard result={result} icon={activeFeature?.icon || Brain} iconColor={activeFeature?.color || 'text-purple-400'} />
              </div>
            )}
          </div>
        </div>
      )}

      {tabSection === 'recommendations' && (
        <Card>
          <h3 className="font-semibold text-white mb-4">AI Recommendations Pending Review</h3>
          {recommendations.length === 0 ? (
            <EmptyState icon={Brain} title="No recommendations" description="Run Next Best Action to generate recommendations" />
          ) : (
            <div className="space-y-3">
              {recommendations.map(r => (
                <div key={r._id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white font-medium">{r.recommendation}</p>
                      <p className="text-xs text-slate-400 mt-1">{r.explanation}</p>
                    </div>
                    <Badge label={r.status} variant={r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'error' : 'warning'} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Confidence: {Math.round(r.confidence * 100)}%</span>
                    {r.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" icon={CheckCircle} onClick={() => reviewRecommendation(r._id, 'Approved')}>Approve</Button>
                        <Button size="sm" variant="danger" icon={XCircle} onClick={() => reviewRecommendation(r._id, 'Rejected')}>Reject</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tabSection === 'runs' && (
        <Card>
          <h3 className="font-semibold text-white mb-4">AI Run History</h3>
          <div className="table-container">
            <table>
              <thead><tr><th>Feature</th><th>Status</th><th>Confidence</th><th>Latency</th><th>Model</th><th>Time</th></tr></thead>
              <tbody>
                {runs.map(r => (
                  <tr key={r._id}>
                    <td className="capitalize">{r.feature}</td>
                    <td><Badge label={r.status} variant={r.status === 'success' ? 'success' : 'error'} /></td>
                    <td className="text-emerald-400">{Math.round((r.confidence || 0) * 100)}%</td>
                    <td className="text-slate-400">{r.latencyMs || 0}ms</td>
                    <td className="text-slate-500 text-xs">{r.modelVersion}</td>
                    <td className="text-slate-500 text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {runs.length === 0 && <div className="text-center py-8 text-slate-500">No AI runs yet</div>}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AICenterPage;
