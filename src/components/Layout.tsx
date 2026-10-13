import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronsLeft,
  FileText,
  Home,
  Leaf,
  LogOut,
  Moon,
  Package,
  Sun,
  User,
  Users,
} from 'lucide-react';
import { useStore } from '../store/store';
import { OFFICIAL_LOGO_URL } from '../pages/Login';

const nav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/orcamentos', label: 'Orçamentos', icon: FileText },
  { to: '/perfil', label: 'Meu Perfil', icon: User },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { userProfile, logout } = useStore();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('ec_dark') === '1');
  const [collapsed, setCollapsed] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ec_dark', dark ? '1' : '0');
  }, [dark]);

  const initials = (userProfile?.nome || 'EC')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex min-h-screen">
      <aside
        className="no-print sticky top-0 flex h-screen shrink-0 flex-col transition-all"
        style={{
          width: collapsed ? 76 : 256,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Logo Header (fiel ao Base44) */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          {!logoError ? (
            <img
              src={OFFICIAL_LOGO_URL}
              alt="Ecompost"
              onError={() => setLogoError(true)}
              className="h-10 w-10 shrink-0 rounded-xl bg-white p-1 object-contain shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-white leading-tight tracking-tight">Ecompost</div>
              <div className="text-[10px] tracking-wider text-emerald-400">
                ECOLOGICAMENTE LUCRATIVO
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
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
                borderLeft: isActive
                  ? '3px solid var(--sidebar-active-border)'
                  : '3px solid transparent',
              })}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Footer: Card Meu Perfil + Modo Escuro + Sair + Recolher */}
        <div className="space-y-1 p-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            type="button"
            onClick={() => navigate('/perfil')}
            title="Abrir Meu Perfil"
            className="mb-1 flex w-full items-center gap-2.5 rounded-xl bg-white/5 px-2.5 py-2 text-left transition hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-white">
                  {userProfile.nome}
                </div>
                <div className="truncate text-[10px] text-emerald-400">
                  {userProfile.registroProfissional || userProfile.cargo}
                </div>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            {dark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!collapsed && <span>{dark ? 'Modo claro' : 'Modo escuro'}</span>}
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-red-500/15 hover:text-red-400"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <ChevronsLeft className={`h-4 w-4 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 sm:p-8">
        <div className="mx-auto max-w-6xl animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
