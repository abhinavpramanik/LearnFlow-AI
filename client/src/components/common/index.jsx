import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button as ShadcnButton } from '../ui/button';
import { Badge as ShadcnBadge } from '../ui/badge';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Skeleton as ShadcnSkeleton } from '../ui/skeleton';
import { Alert as ShadcnAlert, AlertDescription, AlertTitle } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Button Component wrapper for backwards compatibility
export const Button = ({
  children, onClick, variant = 'default', size = 'default', disabled = false, loading = false, type = 'button', className = '', icon: Icon, ...props
}) => {
  // Map our old variants to shadcn variants
  const variantMap = {
    primary: 'default',
    secondary: 'secondary',
    danger: 'destructive',
    ghost: 'ghost',
    success: 'default', // Shadcn doesn't have a success button by default, we can just use default with custom class if needed
    outline: 'outline',
  };

  const mappedVariant = variantMap[variant] || variant;
  
  // Map sizes
  const sizeMap = {
    sm: 'sm',
    md: 'default',
    lg: 'lg',
  };
  const mappedSize = sizeMap[size] || size;

  return (
    <ShadcnButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      variant={mappedVariant}
      size={mappedSize}
      className={cn(variant === 'success' && 'bg-emerald-600 text-white hover:bg-emerald-500', className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="mr-2 h-4 w-4" />
      ) : null}
      {children}
    </ShadcnButton>
  );
};

// Badge Component
export const Badge = ({ label, variant = 'default', className }) => {
  const variantMap = {
    success: 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20',
    error: 'destructive',
    info: 'bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-blue-500/20',
    brand: 'default',
    neutral: 'secondary',
    purple: 'bg-purple-500/15 text-purple-500 hover:bg-purple-500/25 border-purple-500/20',
  };
  
  const customClass = variantMap[variant] || '';
  const isDestructive = variant === 'error';

  return (
    <ShadcnBadge variant={isDestructive ? 'destructive' : 'outline'} className={cn(!isDestructive && customClass, className)}>
      {label}
    </ShadcnBadge>
  );
};

// Skeleton Component
export const Skeleton = ({ className = 'h-4 w-full' }) => (
  <ShadcnSkeleton className={className} />
);

// Card Component (wrapper)
export const Card = ({ children, className = '', hover = false, ...props }) => (
  <ShadcnCard className={cn(hover && "transition-all hover:border-primary hover:shadow-sm", className)} {...props}>
    <CardContent className="p-6">
      {children}
    </CardContent>
  </ShadcnCard>
);

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center animate-in fade-in zoom-in duration-300">
    {Icon && <Icon size={48} className="text-muted-foreground opacity-50" />}
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-muted-foreground text-sm max-w-sm">{description}</p>}
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

// Page Header Component
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

// Stat Card Component
export const StatCard = ({ title, value, icon: Icon, trend, color = 'indigo', subtitle }) => {
  const colors = {
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-500' },
    green: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500' },
    yellow: { bg: 'bg-amber-500/10', icon: 'text-amber-500' },
    red: { bg: 'bg-red-500/10', icon: 'text-red-500' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500' },
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-500' },
  };

  const c = colors[color] || colors.indigo;

  return (
    <ShadcnCard className="transition-all hover:border-primary/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            {subtitle && <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>}
            {trend && <p className={`text-xs mt-2 font-medium ${trend.positive ? 'text-emerald-500' : 'text-red-500'}`}>{trend.label}</p>}
          </div>
          {Icon && (
            <div className={cn("p-3 rounded-xl", c.bg)}>
              <Icon size={22} className={c.icon} />
            </div>
          )}
        </div>
      </CardContent>
    </ShadcnCard>
  );
};

// Confidence Bar Component
export const ConfidenceBar = ({ confidence, label }) => (
  <div className="w-full">
    {label && <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>{label}</span><span>{Math.round(confidence * 100)}%</span></div>}
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${confidence * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{
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
      <Loader2 className={cn("animate-spin text-primary", sizes[size])} />
    </div>
  );
};

// Modal Component (using Shadcn Dialog)
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={sizes[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

// Alert Component
export const Alert = ({ type = 'info', message }) => {
  const types = {
    info: 'default',
    success: 'default', // mapped via class
    warning: 'default',
    error: 'destructive',
  };
  
  const customClass = {
    success: 'border-emerald-500/50 text-emerald-500',
    warning: 'border-amber-500/50 text-amber-500',
    info: 'border-blue-500/50 text-blue-500',
  };

  return (
    <ShadcnAlert variant={types[type]} className={cn(customClass[type])}>
      <AlertDescription>{message}</AlertDescription>
    </ShadcnAlert>
  );
};

// Pagination Component
export const Pagination = ({ pagination, onChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t">
      <span className="text-sm text-muted-foreground">Page {page} of {pages} ({pagination.total} total)</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
};

// AI Result Card
export const AIResultCard = ({ result, icon: Icon, iconColor = 'text-purple-500', iconBg = 'bg-purple-500/10' }) => (
  <ShadcnCard className="border-purple-500/30 overflow-hidden relative">
    <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
    <CardContent className="p-5 relative z-10">
      <div className="flex items-start gap-4 mb-4">
        <div className={cn("p-2.5 rounded-xl", iconBg)}>
          {Icon && <Icon size={20} className={iconColor} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-semibold text-sm leading-relaxed">{result?.result || 'N/A'}</p>
          <p className="text-muted-foreground text-sm mt-1.5">{result?.explanation}</p>
        </div>
        {result?.reviewRequired && <Badge label="Review Required" variant="warning" className="shrink-0" />}
      </div>
      {result?.confidence !== undefined && (
        <div className="mt-2">
          <ConfidenceBar confidence={result.confidence} label="Confidence Score" />
        </div>
      )}
      {result?.modelVersion && (
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
          <span>Model: {result.modelVersion}</span>
          <span>&middot;</span>
          <span>{result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ''}</span>
        </p>
      )}
    </CardContent>
  </ShadcnCard>
);

// Framer Motion Page Wrapper
export const AnimatedPage = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Framer Motion List Wrapper
export const AnimatedList = ({ children, className }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Framer Motion List Item Wrapper
export const AnimatedListItem = ({ children, className, onClick }) => {
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
  return (
    <motion.div variants={item} className={className} onClick={onClick}>
      {children}
    </motion.div>
  );
};
