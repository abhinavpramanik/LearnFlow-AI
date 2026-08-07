import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Eye, EyeOff, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_DASHBOARDS = {
  'Admin': '/dashboard',
  'Service Agent': '/dashboard',
  'Marketing Manager': '/dashboard',
  'Sales Manager': '/dashboard',
  'Customer': '/dashboard',
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      const from = location.state?.from?.pathname || ROLE_DASHBOARDS[user.role?.name] || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: email.includes('admin') ? 'Admin@1234' : email.includes('agent') ? 'Agent@1234' : email.includes('marketing') ? 'Mark@1234' : email.includes('sales') ? 'Sales@1234' : 'Customer@1234' });

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">LearnFlow <span className="text-indigo-400">AI</span></span>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Brain size={24} className="text-indigo-400" />
            <span className="text-indigo-400 font-semibold">AI-Powered Learning Platform</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Unified Customer<br />Journey Intelligence
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md">
            Orchestrate personalized learning journeys with AI-assisted recommendations,
            real-time insights, and enterprise-grade governance.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'AI-Powered', desc: 'Gemini AI integration' },
              { label: 'Enterprise Ready', desc: 'Role-based access control' },
              { label: 'Real-time', desc: 'Live journey tracking' },
              { label: 'Secure', desc: 'JWT & audit logging' },
            ].map(item => (
              <div key={item.label} className="glass rounded-xl p-4">
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-slate-400 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-500 text-sm">© 2025 LearnFlow AI. Enterprise Learning & Development.</p>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">LearnFlow <span className="text-indigo-400">AI</span></span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email address</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`form-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 gradient-brand text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 mb-3 text-center">Demo Accounts (click to fill)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin', email: 'admin@learnflow.ai' },
                { label: 'Agent', email: 'agent@learnflow.ai' },
                { label: 'Marketing', email: 'marketing@learnflow.ai' },
                { label: 'Customer', email: 'customer@learnflow.ai' },
              ].map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="text-xs py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-left"
                >
                  <span className="font-semibold text-indigo-400">{acc.label}</span>
                  <br />
                  <span className="text-slate-500">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
