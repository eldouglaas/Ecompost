import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  LogOut,
  Mail,
  Phone,
  Save,
  User,
} from 'lucide-react';
import { PageHeader } from '../components/ui';
import { useStore } from '../store/store';
import { UserProfile } from '../types';

const ufs = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

const CARGOS_OPCOES = [
  'Agricultor / Produtor Rural',
  'Engenheiro Agrônomo',
  'Consultor Técnico / Especialista',
  'Gestor de Pátio de Compostagem',
  'Operador de Campo / Máquinas',
  'Técnico Agrícola',
  'Administrador',
];

export default function MeuPerfil() {
  const { userProfile, saveUserProfile, logout } = useStore();
  const [form, setForm] = useState<UserProfile>(userProfile);
  const [savedToast, setSavedToast] = useState(false);
  const [cpfError, setCpfError] = useState<string | null>(null);

  const formatCPF = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 3) return raw;
    if (raw.length <= 6) return `${raw.slice(0, 3)}.${raw.slice(3)}`;
    if (raw.length <= 9) return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;
  };

  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
  };

  const setField = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (key === 'cpf') setCpfError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCpf = (form.cpf || '').replace(/\D/g, '');
    if (rawCpf.length < 11) {
      setCpfError('O CPF é obrigatório e deve conter 11 dígitos.');
      return;
    }

    saveUserProfile(form);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho Limpo */}
      <PageHeader
        icon={<User className="text-emerald-600" />}
        title="Perfil do Usuário"
        subtitle="Dados cadastrais básicos de quem está acessando o sistema"
        action={
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" /> Sair da Conta
          </button>
        }
      />

      {savedToast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 animate-fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          Dados salvos com sucesso!
        </div>
      )}

      {/* Formulário Enxuto de Cadastro */}
      <form onSubmit={handleSave} className="card p-6 sm:p-8 space-y-6">
        <div className="border-b pb-4 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Dados Cadastrais
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identificação do usuário logado (produtor rural, técnico ou administrador).
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Nome */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => setField('nome', e.target.value)}
              placeholder="Nome do produtor, técnico ou operador"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* CPF (OBRIGATÓRIO) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              CPF <span className="text-red-500">* (Obrigatório)</span>
            </label>
            <input
              type="text"
              required
              value={form.cpf || ''}
              onChange={(e) => setField('cpf', formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                cpfError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-600'
              }`}
            />
            {cpfError && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {cpfError}
              </p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              E-mail de Acesso <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Telefone / WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Telefone / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => setField('telefone', formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Perfil de Atuação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Perfil de Atuação
            </label>
            <select
              value={form.cargo}
              onChange={(e) => setField('cargo', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {CARGOS_OPCOES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Fazenda / Empresa */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Propriedade Rural / Empresa / Fazenda
            </label>
            <input
              type="text"
              value={form.empresaFazenda}
              onChange={(e) => setField('empresaFazenda', e.target.value)}
              placeholder="Nome da fazenda, sítio ou empresa"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Registro Profissional (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              CREA / CFTA (Opcional)
            </label>
            <input
              type="text"
              value={form.registroProfissional || ''}
              onChange={(e) => setField('registroProfissional', e.target.value)}
              placeholder="Apenas se aplicável"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Cidade */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Cidade
            </label>
            <input
              type="text"
              value={form.cidade}
              onChange={(e) => setField('cidade', e.target.value)}
              placeholder="Ex: Cabeceira Grande"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* UF */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              UF
            </label>
            <select
              value={form.uf}
              onChange={(e) => setField('uf', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {ufs.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-slate-800">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-900/20"
          >
            <Save className="h-4 w-4" /> Salvar Dados
          </button>
        </div>
      </form>
    </div>
  );
}
