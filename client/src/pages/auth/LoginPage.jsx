import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Eye, EyeOff, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

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
    <div className="min-h-screen bg-background flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-muted/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" 
        />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" 
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <BookOpen size={20} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">LearnFlow <span className="text-primary">AI</span></span>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Brain size={24} className="text-primary" />
            <span className="text-primary font-semibold tracking-wide text-sm uppercase">AI-Powered Learning Platform</span>
          </div>
          <h1 className="text-5xl font-extrabold text-foreground leading-tight mb-6">
            Unified Customer<br />Journey Intelligence
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            Orchestrate personalized learning journeys with AI-assisted recommendations,
            real-time insights, and enterprise-grade governance.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'AI-Powered', desc: 'Gemini AI integration' },
              { label: 'Enterprise Ready', desc: 'Role-based access control' },
              { label: 'Real-time', desc: 'Live journey tracking' },
              { label: 'Secure', desc: 'JWT & audit logging' },
            ].map((item, i) => (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                key={item.label} 
                className="bg-background/40 backdrop-blur-md rounded-xl p-4 border border-border"
              >
                <p className="text-foreground font-semibold text-sm">{item.label}</p>
                <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-muted-foreground text-sm">© 2025 LearnFlow AI. Enterprise Learning & Development.</p>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen size={18} className="text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">LearnFlow <span className="text-primary">AI</span></span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email" className={errors.email ? "text-destructive" : ""}>Email address</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.email && <p className="text-[0.8rem] font-medium text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className={errors.password ? "text-destructive" : ""}>Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[0.8rem] font-medium text-destructive">{errors.password}</p>}
            </div>

            <Button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 text-center uppercase tracking-wider font-semibold">Demo Accounts (click to fill)</p>
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
                  className="text-xs py-2 px-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-left border border-border"
                >
                  <span className="font-semibold text-primary">{acc.label}</span>
                  <br />
                  <span className="text-muted-foreground">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
