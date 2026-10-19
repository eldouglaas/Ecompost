import React, { useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  X,
  ArrowLeft,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../store/store';

export default function Login() {
  const { login, userProfile } = useStore();
  const [email, setEmail] = useState(userProfile.email || 'contato@ecompost.agr.br');
  const [password, setPassword] = useState('ecompost2026');
  const [showPass, setShowPass] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [msg, setMsg] = useState<string | null>(null);

  // Modal de Conexão com Conta Google
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setMsg(`Enviamos um link de redefinição para ${email}`);
      setTimeout(() => {
        setMode('login');
        setMsg(null);
      }, 3500);
      return;
    }
    login(email);
  };

  const handleGoogleLogin = (accountEmail?: string, accountName?: string) => {
    setGoogleLoading(true);
    setTimeout(() => {
      login(
        accountEmail || 'douglas.santos.agro@gmail.com',
        accountName || 'Eng. Agr. Douglas Santos'
      );
      setGoogleLoading(false);
      setShowGoogleModal(false);
    }, 600);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 30%, #0d4a2b 0%, #072a17 55%, #03160c 100%)',
      }}
    >
      {/* Luz ambiente de fundo sutil */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Cabeçalho centralizado com ícone oficial da folha */}
      <div className="relative z-10 flex flex-col items-center mb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-black/40 mb-3.5 backdrop-blur-md">
          <Leaf className="w-7 h-7 text-emerald-400 stroke-[2.2]" />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Ecompost
        </h1>
        <p className="text-emerald-300/80 text-sm font-medium mt-1">
          Sistema de Gestão de Compostagem
        </p>
      </div>

      {/* Card principal estilo Glassmorphism fiel à referência */}
      <div className="relative z-10 w-full max-w-[420px] rounded-3xl bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-md shadow-2xl shadow-black/60 p-7 sm:p-8 text-white transition-all">
        {mode === 'login' ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-emerald-100/90 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/25 border border-emerald-500/20 text-white placeholder-emerald-100/30 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-100/90 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-black/25 border border-emerald-500/20 text-white placeholder-emerald-100/30 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-300/50 hover:text-emerald-200 transition-colors"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/40 mt-1"
              >
                Entrar
              </button>
            </form>

            {/* Divisor "ou" */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-500/20" />
              </div>
              <span className="relative px-3 text-xs text-emerald-300/50 bg-[#072a17] rounded-full">
                ou
              </span>
            </div>

            {/* Botão Entrar com Google */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white font-medium text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Entrar com Google</span>
            </button>

            {/* Esqueci minha senha */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setMsg(null);
                }}
                className="text-emerald-400 hover:text-emerald-300 text-xs sm:text-sm font-medium transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          </>
        ) : (
          /* Modo Esqueci Minha Senha */
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="p-1 rounded-lg text-emerald-300/60 hover:text-white hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-bold text-white">Recuperar Senha</h2>
            </div>

            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Informe seu e-mail cadastrado. Enviaremos um link seguro para você
              redefinir sua senha de acesso.
            </p>

            {msg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{msg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-emerald-100/90 mb-1.5">
                  Email cadastrado
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/25 border border-emerald-500/20 text-white placeholder-emerald-100/30 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/40"
              >
                Enviar link de recuperação
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs text-emerald-300/70 hover:text-white transition"
              >
                Voltar para o login
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal de Conexão com Conta Google */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white text-slate-900 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho Google */}
            <div className="flex flex-col items-center text-center mb-5">
              <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <h3 className="font-semibold text-lg text-slate-800">
                Fazer login com o Google
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                para continuar para o app <span className="font-semibold text-emerald-700">Ecompost</span>
              </p>
            </div>

            {/* Contas sugeridas */}
            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() =>
                  handleGoogleLogin(
                    'douglas.santos.agro@gmail.com',
                    'Eng. Agr. Douglas Santos'
                  )
                }
                disabled={googleLoading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-slate-50 transition text-left"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  DS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">
                    Eng. Agr. Douglas Santos
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    douglas.santos.agro@gmail.com
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleGoogleLogin(
                    userProfile.email || 'contato@ecompost.agr.br',
                    userProfile.nome || 'Usuário Ecompost'
                  )
                }
                disabled={googleLoading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-slate-50 transition text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  EC
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">
                    Conta Corporativa Ecompost
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {userProfile.email || 'contato@ecompost.agr.br'}
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Conexão segura OAuth 2.0
              </span>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
