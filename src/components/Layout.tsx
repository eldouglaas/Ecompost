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
        className="no-print sticky top-0 flex h-screen shrink-0 flex-col transition-all duration-200 select-none"
        style={{
          width: collapsed ? 76 : 256,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Logo Header idêntico à tela de Login */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900/60 border border-emerald-500/30 shadow-md shadow-black/30 backdrop-blur-sm">
            <Leaf className="h-5 w-5 text-emerald-400 stroke-[2.2]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-extrabold text-white text-base leading-tight tracking-tight">
                Ecompost
              </div>
              <div className="text-[10px] font-medium tracking-wide text-emerald-300/80">
                Gestão de Compostagem
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-white font-semibold border-l-[3px] border-emerald-400 shadow-sm shadow-emerald-950/20'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/[0.05] border-l-[3px] border-transparent'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer: Card Meu Perfil + Controles */}
        <div
          className="space-y-1.5 p-3"
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          {/* Card Meu Perfil estilo Glassmorphism */}
          <button
            type="button"
            onClick={() => navigate('/perfil')}
            title="Abrir Meu Perfil"
            className="mb-2 flex w-full items-center gap-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-900/30 px-2.5 py-2 text-left transition-all group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700/80 border border-emerald-500/30 text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-white group-hover:text-emerald-200 transition-colors">
                  {userProfile.nome}
                </div>
                <div className="truncate text-[10px] text-emerald-300/80">
                  {userProfile.registroProfissional || userProfile.cargo}
                </div>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-emerald-100/70 transition hover:bg-white/[0.05] hover:text-white"
          >
            {dark ? (
              <Sun className="h-4 w-4 shrink-0 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 shrink-0" />
            )}
            {!collapsed && <span>{dark ? 'Modo claro' : 'Modo escuro'}</span>}
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-emerald-100/70 transition hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-emerald-100/70 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ChevronsLeft
              className={`h-4 w-4 shrink-0 transition-transform ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
            {!collapsed && <span>Recolher menu</span>}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 sm:p-8">
        <div className="mx-auto max-w-6xl animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
