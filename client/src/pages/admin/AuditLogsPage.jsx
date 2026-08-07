import { useState, useEffect } from 'react';
import { auditService } from '../../services';
import { Card, PageHeader, Spinner, Badge, EmptyState, Pagination } from '../../components/common';
import { ClipboardList, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

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
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable record of all critical system actions"
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text" placeholder="Filter by action (e.g. auth:login)..."
              value={filters.action}
              onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}
              className="form-input pl-9"
            />
          </div>
          <select
            value={filters.entity}
            onChange={e => setFilters(f => ({ ...f, entity: e.target.value }))}
            className="form-input w-auto"
          >
            <option value="">All Entities</option>
            {['User', 'Ticket', 'Campaign', 'Recommendation', 'Setting'].map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : logs.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No audit logs found" description="Actions logged here are immutable records" />
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log._id}>
                <div
                  onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-600"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-indigo-400 text-xs bg-indigo-500/10 px-2 py-0.5 rounded">{log.action}</code>
                      <Badge label={log.entity} variant={ENTITY_COLORS[log.entity] || 'neutral'} />
                      <Badge label={log.outcome} variant={log.outcome === 'success' ? 'success' : 'error'} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      by <span className="text-slate-300">{log.actor?.firstName || 'System'} {log.actor?.lastName || ''}</span>
                      {log.ipAddress && <span className="ml-2 text-slate-500">• {log.ipAddress}</span>}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {/* Expanded Detail */}
                {expanded === log._id && (log.previousValue || log.newValue) && (
                  <div className="mx-4 mb-2 p-4 bg-slate-900 rounded-b-xl border border-t-0 border-slate-700 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {log.previousValue && (
                        <div>
                          <p className="text-slate-500 mb-1 font-semibold uppercase tracking-wider">Before</p>
                          <pre className="text-red-300 bg-red-500/5 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(log.previousValue, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.newValue && (
                        <div>
                          <p className="text-slate-500 mb-1 font-semibold uppercase tracking-wider">After</p>
                          <pre className="text-green-300 bg-green-500/5 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(log.newValue, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onChange={setPage} />
      </Card>
    </div>
  );
};

export default AuditLogsPage;
