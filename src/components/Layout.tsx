import { ReactNode, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronsLeft, FileText, Home, Leaf, Moon, Package, Sun, Users } from 'lucide-react';

const nav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/orcamentos', label: 'Orçamentos', icon: FileText },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => localStorage.getItem('ec_dark') === '1');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ec_dark', dark ? '1' : '0');
  }, [dark]);

  return (
    <div className="flex min-h-screen">
      <aside
        className="no-print sticky top-0 flex h-screen shrink-0 flex-col transition-all"
        style={{ width: collapsed ? 76 : 250, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-white leading-tight">Ecompost</div>
              <div className="text-[10px] tracking-wider text-emerald-400">ECOLOGICAMENTE LUCRATIVO</div>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
              style={({ isActive }) => ({
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                color: isActive ? '#fff' : 'var(--sidebar-text)',
                borderLeft: isActive ? '3px solid var(--sidebar-active-border)' : '3px solid transparent',
              })}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 p-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <button onClick={() => setDark(!dark)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {!collapsed && (dark ? 'Modo claro' : 'Modo escuro')}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800">
            <ChevronsLeft className={`h-5 w-5 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && 'Recolher'}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-6xl animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
