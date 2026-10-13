import { useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  Leaf,
  Lock,
  Mail,
  Thermometer,
  User,
} from 'lucide-react';
import { useStore } from '../store/store';

export const OFFICIAL_LOGO_URL =
  'https://media.base44.com/images/public/6a76a4c58f4d46bf9a83da92/432773682_image.png';

export default function Login() {
  const { login, userProfile } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState(userProfile.email || 'contato@ecompost.agr.br');
  const [password, setPassword] = useState('ecompost2026');
  const [nome, setNome] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setMsg('Enviamos um link de redefinição de senha para ' + email);
      return;
    }
    login(email, mode === 'register' && nome ? nome : undefined);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-slate-900">
      {/* Painel esquerdo institucional idêntico ao Base44 ($ne) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 flex-col justify-between text-white bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          {!logoError ? (
            <img
              src={OFFICIAL_LOGO_URL}
              alt="Ecompost"
              onError={() => setLogoError(true)}
              className="w-12 h-12 rounded-2xl object-contain bg-white p-1.5 shadow-lg"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-emerald-700" />
            </div>
          )}
          <div>
            <div className="font-bold text-xl tracking-tight">Ecompost</div>
            <div className="text-xs text-emerald-200 tracking-wider uppercase">
              Sistema de Gestão de Compostagem
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Transforme resíduos em adubo de alta qualidade.
          </h1>
          <p className="text-emerald-100/90 text-base leading-relaxed">
            Planeje receitas com equilíbrio C:N, acompanhe a temperatura das leiras dia a dia e
            gere orçamentos profissionais em poucos cliques.
          </p>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {[
              {
                icon: FlaskConical,
                title: 'Cálculo automático da receita',
                desc: 'Relação C:N, umidade, densidade e nutrientes calculados na hora',
              },
              {
                icon: Thermometer,
                title: 'Acompanhamento de temperatura',
                desc: 'Gráfico da evolução das leiras e alertas da faixa ideal (45–65°C)',
              },
              {
                icon: FileText,
                title: 'Relatórios prontos em PDF',
                desc: 'Orçamento, montagem de leira (Kg/m) e ficha de monitoramento',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10"
              >
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-xs text-emerald-100/80">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/70">
          Ecompost — Ecologicamente Lucrativo
        </div>
      </div>

      {/* Painel direito de autenticação */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            {!logoError ? (
              <img
                src={OFFICIAL_LOGO_URL}
                alt="Ecompost"
                onError={() => setLogoError(true)}
                className="w-11 h-11 rounded-2xl object-contain bg-white p-1 shadow"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center shadow">
                <Leaf className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <div className="font-bold text-lg text-slate-900">Ecompost</div>
              <div className="text-xs text-slate-500">Gestão de Compostagem</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-7 sm:p-8">
            {mode !== 'forgot' && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setMsg(null);
                  }}
                  className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setMsg(null);
                  }}
                  className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Criar conta
                </button>
              </div>
            )}

            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                {mode === 'login'
                  ? 'Bem-vindo de volta'
                  : mode === 'register'
                  ? 'Crie sua conta no Ecompost'
                  : 'Recuperar senha'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Entre com seu e-mail e senha para acessar seus orçamentos e leiras.'
                  : mode === 'register'
                  ? 'Cadastre seus dados para começar a planejar e monitorar compostagem.'
                  : 'Informe seu e-mail para receber as instruções de redefinição.'}
              </p>
            </div>

            {msg && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{msg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome ou propriedade"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Senha</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setMsg(null);
                        }}
                        className="text-xs text-emerald-700 hover:underline font-medium"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                {mode === 'login'
                  ? 'Entrar no Sistema'
                  : mode === 'register'
                  ? 'Criar Conta e Acessar'
                  : 'Enviar Link de Recuperação'}
              </button>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setMsg(null);
                  }}
                  className="w-full py-2 text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  Voltar para o login
                </button>
              )}
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => login()}
                className="w-full py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Acesso Direto Demonstrativo ({userProfile.nome})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
