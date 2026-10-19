import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sliders,
  User,
  Users,
  Award,
  AlertCircle,
  KeyRound,
  FileText,
  Activity,
  Layers,
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
  const [activeTab, setActiveTab] = useState<'cadastro' | 'acesso' | 'padroes'>('cadastro');
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

  const setPref = <K extends keyof UserProfile['preferencias']>(
    key: K,
    val: UserProfile['preferencias'][K]
  ) => {
    setForm((prev) => ({
      ...prev,
      preferencias: { ...prev.preferencias, [key]: val },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCpf = (form.cpf || '').replace(/\D/g, '');
    if (rawCpf.length < 11) {
      setCpfError('O CPF é obrigatório e deve conter 11 dígitos.');
      setActiveTab('cadastro');
      return;
    }

    saveUserProfile(form);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const permissoesLista = [
    {
      titulo: 'Elaboração e Edição de Orçamentos',
      descricao: 'Permite criar fórmulas, balancear relação C:N e gerar orçamentos completos.',
      liberado: true,
      icone: FileText,
    },
    {
      titulo: 'Monitoramento Térmico de Leiras',
      descricao: 'Lançamento diário de temperaturas, pontos de sonda e umidade.',
      liberado: true,
      icone: Activity,
    },
    {
      titulo: 'Emissão de Relatório Geral e Fichas PDF',
      descricao: 'Exportação oficial de relatórios técnicos, fichas de montagem e gráficos.',
      liberado: true,
      icone: Layers,
    },
    {
      titulo: 'Catálogo de Produtos e Insumos',
      descricao: 'Consulta e inclusão de matérias-primas orgânicas e minerais.',
      liberado: true,
      icone: Sliders,
    },
    {
      titulo: 'Gestão de Clientes e Fazendas',
      descricao: 'Cadastro de propriedades agrícolas e contatos dos produtores.',
      liberado: true,
      icone: Users,
    },
    {
      titulo: 'Administração de Permissões e Acessos',
      descricao: 'Conceder ou revogar permissões para outros operadores e consultores.',
      liberado: (form.nivelAcesso || 'Administrador') === 'Administrador',
      icone: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho Limpo */}
      <PageHeader
        icon={<User className="text-emerald-600" />}
        title="Meu Perfil"
        subtitle="Cadastro pessoal, identificação de acesso e permissões no sistema"
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
          Dados e permissões do perfil salvos com sucesso!
        </div>
      )}

      {/* Navegação por Abas Limpa */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('cadastro')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'cadastro'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Dados Cadastrais
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('acesso')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'acesso'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Nível de Acesso & Permissões
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">
            Ativo
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('padroes')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'padroes'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Padrões de Campo
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ABA 1: DADOS CADASTRAIS (ENXUTO E DIRETO) */}
        {activeTab === 'cadastro' && (
          <div className="card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Identificação do Usuário
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informações básicas para registro no sistema (produtores rurais, técnicos e administradores).
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                Cadastro Obrigatório
              </span>
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
                  placeholder="Nome do produtor, técnico ou gestor"
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

              {/* Perfil de Atuação (Amplo e inclusivo) */}
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
                  Registro Profissional (Opcional)
                </label>
                <input
                  type="text"
                  value={form.registroProfissional || ''}
                  onChange={(e) => setField('registroProfissional', e.target.value)}
                  placeholder="CREA ou CFTA (se aplicável)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Apenas para engenheiros ou técnicos.
                </span>
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
          </div>
        )}

        {/* ABA 2: CONTROLE DE ACESSO & PERMISSIONAMENTO */}
        {activeTab === 'acesso' && (
          <div className="space-y-6">
            {/* Status do Acesso */}
            <div className="card p-6 bg-gradient-to-r from-emerald-950/20 via-slate-900/10 to-transparent border-emerald-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {form.nome || 'Usuário'}
                      </h2>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {form.statusAcesso || 'Ativo'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Nível de Acesso: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{form.nivelAcesso || 'Administrador'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Autenticação ativa via E-mail / Google</span>
                </div>
              </div>
            </div>

            {/* Matriz de Permissões para o futuro permissionamento */}
            <div className="card p-6">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Permissões do Usuário no Sistema
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Módulos e operações habilitados para esta conta de acesso.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {permissoesLista.map((perm) => {
                  const Icon = perm.icone;
                  return (
                    <div
                      key={perm.titulo}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                        perm.liberado
                          ? 'border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          perm.liberado
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {perm.titulo}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              perm.liberado
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {perm.liberado ? 'Liberado' : 'Restrito'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {perm.descricao}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                💡 <span className="font-semibold text-slate-800 dark:text-slate-200">Pronto para Permissionamento:</span> Em futuras expansões, os perfis de agricultores e operadores de pátio poderão ter acessos específicos configurados pelo Administrador da conta.
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: PADRÕES AGRONÔMICOS DE CAMPO (SEPARADO E ORGANIZADO) */}
        {activeTab === 'padroes' && (
          <div className="card p-6 space-y-5">
            <div className="border-b pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Padrões Operacionais de Pátio
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Valores pré-carregados ao criar um novo orçamento e ao calcular viagens de concha de pá carregadeira.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assinatura Padrão nos Relatórios
                </label>
                <input
                  type="text"
                  value={form.preferencias.consultorPadrao}
                  onChange={(e) => setPref('consultorPadrao', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Umidade Final Padrão (%)
                </label>
                <select
                  value={form.preferencias.umidadeFinalPadrao}
                  onChange={(e) => setPref('umidadeFinalPadrao', +e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {[20, 25, 30, 35, 40, 45, 50].map((v) => (
                    <option key={v} value={v}>
                      {v}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Capacidade da Concha (m³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.2}
                  value={form.preferencias.capacidadeConchaM3}
                  onChange={(e) => setPref('capacidadeConchaM3', +e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Extensão Padrão por Leira (m)
                </label>
                <input
                  type="number"
                  step="1"
                  value={form.preferencias.leiraExtensaoPadrao}
                  onChange={(e) => setPref('leiraExtensaoPadrao', +e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Altura Padrão da Leira (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.preferencias.leiraAlturaPadrao}
                  onChange={(e) => setPref('leiraAlturaPadrao', +e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Base Menor / Topo (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.preferencias.leiraBaseMenorPadrao}
                  onChange={(e) => setPref('leiraBaseMenorPadrao', +e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Base Maior / Fundo (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.preferencias.leiraBaseMaiorPadrao}
                  onChange={(e) => setPref('leiraBaseMaiorPadrao', +e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botão de Salvar Fixo/Elegante */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-900/20"
          >
            <Save className="h-4 w-4" /> Salvar Alterações do Perfil
          </button>
        </div>
      </form>
    </div>
  );
}
