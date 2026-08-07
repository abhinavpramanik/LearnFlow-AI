import { useState, useEffect } from 'react';
import { auditService } from '../../services';
import { Card, PageHeader, Spinner, Badge, EmptyState, Pagination, AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/common';
import { ClipboardList, Search, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '../../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const ENTITY_COLORS = {
  User: 'info', Ticket: 'warning', Campaign: 'brand', Recommendation: 'purple',
  Setting: 'neutral', AuditLog: 'neutral',
};

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ action: '', entity: '' });
  const [expanded, setExpanded] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.getLogs({ page, limit: 20, ...filters });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page, filters]);

  return (
    <AnimatedPage className="space-y-6 pb-10">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable record of all critical system actions"
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text" placeholder="Filter by action (e.g. auth:login)..."
              value={filters.action}
              onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}
              className="pl-9"
            />
          </div>
          <select
            value={filters.entity}
            onChange={e => setFilters(f => ({ ...f, entity: e.target.value }))}
            className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Entities</option>
            {['User', 'Ticket', 'Campaign', 'Recommendation', 'Setting'].map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : logs.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={ClipboardList} title="No audit logs found" description="Actions logged here are immutable records" />
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {logs.map(log => {
              const isExpanded = expanded === log._id;
              const hasDetails = log.previousValue || log.newValue;
              return (
                <div key={log._id} className="bg-card hover:bg-muted/30 transition-colors">
                  <div
                    onClick={() => hasDetails && setExpanded(isExpanded ? null : log._id)}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 ${hasDetails ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <code className="text-primary text-xs bg-primary/10 px-2.5 py-1 rounded-md font-semibold tracking-wide border border-primary/20">{log.action}</code>
                        <Badge label={log.entity} variant={ENTITY_COLORS[log.entity] || 'neutral'} />
                        <Badge label={log.outcome} variant={log.outcome === 'success' ? 'success' : 'error'} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by <span className="font-medium text-foreground">{log.actor?.firstName || 'System'} {log.actor?.lastName || ''}</span>
                        {log.ipAddress && <span className="ml-2 font-mono text-xs opacity-70">• {log.ipAddress}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0 mt-2 sm:mt-0">
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                      {hasDetails && (
                        <div className="text-muted-foreground p-1 rounded-md hover:bg-muted/50 transition-colors">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && hasDetails && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-muted/20 border-t border-border"
                      >
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          {log.previousValue && (
                            <div>
                              <p className="text-muted-foreground mb-2 font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-destructive"></span> Before
                              </p>
                              <pre className="text-destructive/80 bg-destructive/10 border border-destructive/20 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono text-xs custom-scrollbar">
                                {JSON.stringify(log.previousValue, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newValue && (
                            <div>
                              <p className="text-muted-foreground mb-2 font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> After
                              </p>
                              <pre className="text-emerald-500/80 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono text-xs custom-scrollbar">
                                {JSON.stringify(log.newValue, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
        <div className="p-4 border-t border-border bg-card">
          <Pagination pagination={pagination} onChange={setPage} />
        </div>
      </Card>
    </AnimatedPage>
  );
};

export default AuditLogsPage;
