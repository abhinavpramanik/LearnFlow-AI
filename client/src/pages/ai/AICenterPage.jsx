import { useState, useEffect } from 'react';
import { aiService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, AIResultCard, EmptyState, Pagination, AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/common';
import { Brain, Zap, MessageSquare, Lightbulb, Eye, CheckCircle, XCircle, Edit3, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const AI_FEATURES = [
  { id: 'intent', label: 'Intent Classification', icon: Lightbulb, desc: 'Classify customer message intent', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'sentiment', label: 'Sentiment Analysis', icon: MessageSquare, desc: 'Analyze message sentiment', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'summarize', label: 'Conversation Summary', icon: Edit3, desc: 'Summarize ticket conversation', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'recommend', label: 'Next Best Action', icon: Zap, desc: 'Get AI recommendation for a profile', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'draft', label: 'Draft Reply', icon: Brain, desc: 'AI-draft a response for a ticket', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
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
    <AnimatedPage className="space-y-6">
      <PageHeader title="AI Center" subtitle="Powered by Google Gemini — all outputs require human review" />

      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit border border-border">
        {['tools', 'recommendations', 'runs'].map(s => (
          <button key={s} onClick={() => setTabSection(s)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${tabSection === s ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'}`}>
            {s}
          </button>
        ))}
      </div>

      {tabSection === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feature Selector */}
          <div className="space-y-3">
            {AI_FEATURES.map(f => (
              <button key={f.id} onClick={() => { setActive(f.id); setResult(null); }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${active === f.id ? `border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20` : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'}`}>
                <div className={`p-2.5 rounded-lg shrink-0 ${active === f.id ? f.bg : 'bg-muted'}`}>
                  <f.icon size={20} className={active === f.id ? f.color : 'text-muted-foreground'} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${active === f.id ? 'text-primary' : 'text-foreground'}`}>{f.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Input & Result */}
          <div className="lg:col-span-2 space-y-6">
            <Card className={`border shadow-sm transition-colors duration-300 ${activeFeature?.border || 'border-border'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${activeFeature?.bg}`}>
                  {activeFeature && <activeFeature.icon size={20} className={activeFeature.color} />}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{activeFeature?.label}</h3>
                  <p className="text-xs text-muted-foreground">Configure and run</p>
                </div>
                <Badge label="Gemini 1.5 Flash" variant="purple" className="ml-auto" />
              </div>
              
              <div className="space-y-5">
                {['intent', 'sentiment'].includes(active) && (
                  <div className="space-y-2">
                    <Label>Customer Message</Label>
                    <textarea rows={4} placeholder="Enter the customer message to analyze..." value={input.message} onChange={e => setInput(i => ({ ...i, message: e.target.value }))} className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
                  </div>
                )}
                {['summarize', 'draft'].includes(active) && (
                  <div className="space-y-2">
                    <Label>Ticket ID</Label>
                    <Input type="text" placeholder="Enter ticket MongoDB ID..." value={input.ticketId} onChange={e => setInput(i => ({ ...i, ticketId: e.target.value }))} />
                  </div>
                )}
                {active === 'recommend' && (
                  <div className="space-y-2">
                    <Label>Profile ID</Label>
                    <Input type="text" placeholder="Enter profile MongoDB ID..." value={input.profileId} onChange={e => setInput(i => ({ ...i, profileId: e.target.value }))} />
                  </div>
                )}
                
                <div className="pt-2">
                  <Button loading={loading} onClick={run} icon={Zap} className="w-full sm:w-auto" size="lg">Run Analysis</Button>
                </div>
              </div>
            </Card>

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AIResultCard result={result} icon={activeFeature?.icon || Brain} iconColor={activeFeature?.color} iconBg={activeFeature?.bg} />
              </motion.div>
            )}
          </div>
        </div>
      )}

      {tabSection === 'recommendations' && (
        <Card>
          <h3 className="font-semibold text-foreground mb-6">AI Recommendations Pending Review</h3>
          {recommendations.length === 0 ? (
            <EmptyState icon={Brain} title="No recommendations" description="Run Next Best Action to generate recommendations" />
          ) : (
            <AnimatedList className="space-y-4">
              {recommendations.map(r => (
                <AnimatedListItem key={r._id} className="p-5 rounded-xl bg-card border hover:border-primary/50 transition-colors shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-foreground font-semibold text-lg">{r.recommendation}</p>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.explanation}</p>
                    </div>
                    <Badge label={r.status} variant={r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'error' : 'warning'} className="self-start" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Zap size={14} className={r.confidence > 0.8 ? 'text-emerald-500' : 'text-amber-500'} /> 
                      Confidence: {Math.round(r.confidence * 100)}%
                    </span>
                    {r.status === 'Pending' && (
                      <div className="flex gap-3">
                        <Button size="sm" variant="success" icon={CheckCircle} onClick={() => reviewRecommendation(r._id, 'Approved')}>Approve</Button>
                        <Button size="sm" variant="danger" icon={XCircle} onClick={() => reviewRecommendation(r._id, 'Rejected')}>Reject</Button>
                      </div>
                    )}
                  </div>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          )}
        </Card>
      )}

      {tabSection === 'runs' && (
        <Card className="overflow-hidden p-0">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">AI Run History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Feature</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Confidence</th>
                  <th className="px-6 py-3 font-medium">Latency</th>
                  <th className="px-6 py-3 font-medium">Model</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {runs.map(r => (
                  <tr key={r._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 capitalize font-medium text-foreground">{r.feature}</td>
                    <td className="px-6 py-4"><Badge label={r.status} variant={r.status === 'success' ? 'success' : 'error'} /></td>
                    <td className="px-6 py-4 text-emerald-500 font-medium">{Math.round((r.confidence || 0) * 100)}%</td>
                    <td className="px-6 py-4 text-muted-foreground">{r.latencyMs || 0}ms</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{r.modelVersion}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {runs.length === 0 && <div className="text-center py-12 text-muted-foreground">No AI runs yet</div>}
          </div>
        </Card>
      )}
    </AnimatedPage>
  );
};

export default AICenterPage;
