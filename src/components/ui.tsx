import { ReactNode } from 'react';
import { X } from 'lucide-react';

export function PageHeader({ icon, title, subtitle, action }: { icon?: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <span className="text-emerald-600">{icon}</span>
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({ label, value, color }: { label: string; value: ReactNode; color: string }) {
  return (
    <div className="card flex items-center gap-2 px-3 py-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="text-sm font-bold leading-tight">{value}</div>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-2xl overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-70';
export const inputStyle = { background: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-main)' };

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} style={inputStyle} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputCls} style={inputStyle} />;
}
