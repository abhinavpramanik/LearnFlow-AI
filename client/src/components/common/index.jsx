// Button Component
export const Button = ({
  children, onClick, variant = 'primary', size = 'md', disabled = false, loading = false, type = 'button', className = '', icon: Icon
}) => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white border-transparent',
    danger: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
    ghost: 'bg-transparent hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent',
    outline: 'bg-transparent hover:bg-indigo-500/10 text-indigo-400 border-indigo-500/50 hover:border-indigo-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg border
        transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {children}
    </button>
  );
};

// Badge Component
export const Badge = ({ label, variant = 'neutral' }) => (
  <span className={`badge badge-${variant}`}>{label}</span>
);

// Skeleton Component
export const Skeleton = ({ className = 'h-4 w-full' }) => (
  <div className={`skeleton ${className}`} />
);

// Card Component
export const Card = ({ children, className = '', hover = false }) => (
  <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>
    {children}
  </div>
);

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    {Icon && <Icon size={48} className="text-slate-600" />}
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-slate-400 text-sm max-w-sm">{description}</p>}
    </div>
    {action}
  </div>
);

// Page Header Component
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

// Stat Card Component
export const StatCard = ({ title, value, icon: Icon, trend, color = 'indigo', subtitle }) => {
  const colors = {
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400', border: 'border-indigo-500/20' },
    green: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    yellow: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
    red: { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'border-red-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20' },
  };

  const c = colors[color] || colors.indigo;

  return (
    <Card className={`border ${c.border} card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
          {trend && <p className={`text-xs mt-2 font-medium ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>{trend.label}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${c.bg}`}>
            <Icon size={22} className={c.icon} />
          </div>
        )}
      </div>
    </Card>
  );
};

// Confidence Bar Component
export const ConfidenceBar = ({ confidence, label }) => (
  <div>
    {label && <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{label}</span><span>{Math.round(confidence * 100)}%</span></div>}
    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${confidence * 100}%`,
          background: confidence > 0.8 ? '#10b981' : confidence > 0.5 ? '#f59e0b' : '#ef4444',
        }}
      />
    </div>
  </div>
);

// Spinner
export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin`} />
    </div>
  );
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} card border-slate-600 shadow-2xl animate-fade-in`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Alert Component
export const Alert = ({ type = 'info', message }) => {
  const types = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
  };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${types[type]}`}>{message}</div>
  );
};

// Pagination Component
export const Pagination = ({ pagination, onChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
      <span className="text-sm text-slate-400">Page {page} of {pages} ({pagination.total} total)</span>
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className="px-3 py-1.5 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <button disabled={page === pages} onClick={() => onChange(page + 1)} className="px-3 py-1.5 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>
  );
};

// AI Result Card
export const AIResultCard = ({ result, icon: Icon, iconColor = 'text-purple-400', iconBg = 'bg-purple-500/10' }) => (
  <div className="card border-purple-500/20">
    <div className="flex items-start gap-3 mb-3">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        {Icon && <Icon size={18} className={iconColor} />}
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold text-sm">{result?.result || 'N/A'}</p>
        <p className="text-slate-400 text-xs mt-1">{result?.explanation}</p>
      </div>
      {result?.reviewRequired && <span className="badge badge-warning">Review Required</span>}
    </div>
    {result?.confidence !== undefined && (
      <ConfidenceBar confidence={result.confidence} label="Confidence" />
    )}
    {result?.modelVersion && (
      <p className="text-xs text-slate-600 mt-2">Model: {result.modelVersion} · {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ''}</p>
    )}
  </div>
);
