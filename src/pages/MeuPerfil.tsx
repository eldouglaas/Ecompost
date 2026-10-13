import { useState } from 'react';
import {
  Award,
  Building2,
  Check,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Ruler,
  Save,
  Sliders,
  User,
} from 'lucide-react';
import { Field, Input, PageHeader, Select } from '../components/ui';
import { brl, num, useStore } from '../store/store';
import { UserProfile } from '../types';

const ufs = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

export default function MeuPerfil() {
  const { userProfile, saveUserProfile, orcamentos, clientes, produtos, logout, resetToOfficialData } =
    useStore();
  const [form, setForm] = useState<UserProfile>(userProfile);
  const [savedToast, setSavedToast] = useState(false);

  const setField = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
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
    saveUserProfile(form);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const totalHectares = orcamentos.reduce((s, o) => s + (o.areaHa || 0), 0);
  const totalToneladas = orcamentos.reduce((s, o) => s + (o.pesoFinalTn || 0), 0);
  const totalFinanceiro = orcamentos.reduce((s, o) => s + (o.custoTotal || 0), 0);

  const initials = form.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<User />}
        title="Meu Perfil"
        subtitle="Dados profissionais, credenciais técnicas (CREA/CFTA) e padrões agronômicos de campo"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400"
            >
              <LogOut className="h-4 w-4" /> Sair da Conta
            </button>
          </div>
        }
      />

      {savedToast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
          <Check className="h-4 w-4 text-emerald-600" />
          Perfil e preferências agronômicas salvos com sucesso!
        </div>
      )}

      {/* Resumo do Perfil + Indicadores */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card flex flex-col justify-between p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-xl font-bold text-white shadow-md">
              {initials || 'EC'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-bold">{form.nome}</div>
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {form.cargo}
              </div>
              {form.registroProfissional && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <Award className="h-3 w-3" /> {form.registroProfissional}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-2 border-t pt-4 text-xs" style={{ borderColor: 'var(--border-card)' }}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5 text-emerald-600" /> {form.email}
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Phone className="h-3.5 w-3.5 text-emerald-600" /> {form.telefone}
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" /> {form.empresaFazenda}
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {form.cidade} — {form.uf}
            </div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Resumo da Carteira Técnica no Sistema
            </h3>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              Conta Ativa · Base44 Sync
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-subtle)' }}>
              <div className="text-[11px] uppercase text-slate-400">Projetos</div>
              <div className="mt-1 text-2xl font-bold">{orcamentos.length}</div>
              <div className="text-[11px] text-slate-500">{clientes.length} clientes ativos</div>
            </div>
            <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-subtle)' }}>
              <div className="text-[11px] uppercase text-slate-400">Área Atendida</div>
              <div className="mt-1 text-2xl font-bold">{num(totalHectares, 0)}</div>
              <div className="text-[11px] text-slate-500">hectares planejados</div>
            </div>
            <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-subtle)' }}>
              <div className="text-[11px] uppercase text-slate-400">Composto Total</div>
              <div className="mt-1 text-2xl font-bold">{num(totalToneladas, 0)}</div>
              <div className="text-[11px] text-slate-500">toneladas produzidas</div>
            </div>
            <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-subtle)' }}>
              <div className="text-[11px] uppercase text-slate-400">Insumos</div>
              <div className="mt-1 text-2xl font-bold">{produtos.length}</div>
              <div className="text-[11px] text-slate-500">{brl(totalFinanceiro)} em projetos</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              Suas preferências abaixo preenchem automaticamente os novos orçamentos e o cálculo de conchas na montagem da leira.
            </span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja restaurar todos os dados oficiais de fábrica do Base44?')) {
                  resetToOfficialData();
                }
              }}
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restaurar Base Oficial
            </button>
          </div>
        </div>
      </div>

      {/* Formulário de Edição */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            <h2 className="text-base font-bold">Informações Pessoais e Profissionais</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Nome Completo *">
              <Input
                required
                value={form.nome}
                onChange={(e) => setField('nome', e.target.value)}
              />
            </Field>
            <Field label="Cargo / Perfil de Uso">
              <Select
                value={form.cargo}
                onChange={(e) => setField('cargo', e.target.value)}
              >
                <option value="Engenheiro Agrônomo & Consultor Técnico">
                  Engenheiro Agrônomo & Consultor Técnico
                </option>
                <option value="Agricultor / Produtor Rural">
                  Agricultor / Produtor Rural
                </option>
                <option value="Gestor de Pátio de Compostagem">
                  Gestor de Pátio de Compostagem
                </option>
                <option value="Técnico Agrícola">Técnico Agrícola</option>
              </Select>
            </Field>
            <Field label="Registro Profissional (CREA / CFTA)">
              <Input
                value={form.registroProfissional}
                placeholder="Ex: CREA-MG 148.920/D"
                onChange={(e) => setField('registroProfissional', e.target.value)}
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
              />
            </Field>
            <Field label="Telefone / WhatsApp">
              <Input
                value={form.telefone}
                onChange={(e) => setField('telefone', e.target.value)}
              />
            </Field>
            <Field label="Empresa / Fazenda Principal">
              <Input
                value={form.empresaFazenda}
                onChange={(e) => setField('empresaFazenda', e.target.value)}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Cidade">
                <Input
                  value={form.cidade}
                  onChange={(e) => setField('cidade', e.target.value)}
                />
              </Field>
            </div>
            <Field label="UF">
              <Select value={form.uf} onChange={(e) => setField('uf', e.target.value)}>
                {ufs.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-1 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-600" />
            <h2 className="text-base font-bold">
              Padrões Agronômicos e Geometria de Leira (Pátio de Compostagem)
            </h2>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Valores pré-carregados ao abrir um Novo Orçamento e ao dimensionar cargas de pá carregadeira no campo.
          </p>

          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Assinatura do Consultor (Relatórios)">
              <Input
                value={form.preferencias.consultorPadrao}
                onChange={(e) => setPref('consultorPadrao', e.target.value)}
              />
            </Field>
            <Field label="Umidade Final Padrão (%)">
              <Select
                value={form.preferencias.umidadeFinalPadrao}
                onChange={(e) => setPref('umidadeFinalPadrao', +e.target.value)}
              >
                {[20, 25, 30, 35, 40, 45, 50].map((v) => (
                  <option key={v} value={v}>
                    {v}%
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Capacidade da Concha / Pá Carregadeira (m³)">
              <Input
                type="number"
                step="0.1"
                min={0.2}
                value={form.preferencias.capacidadeConchaM3}
                onChange={(e) => setPref('capacidadeConchaM3', +e.target.value)}
              />
            </Field>
            <Field label="Extensão Padrão por Leira (m)">
              <Input
                type="number"
                step="1"
                value={form.preferencias.leiraExtensaoPadrao}
                onChange={(e) => setPref('leiraExtensaoPadrao', +e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Altura Padrão da Leira (m)">
              <Input
                type="number"
                step="0.1"
                value={form.preferencias.leiraAlturaPadrao}
                onChange={(e) => setPref('leiraAlturaPadrao', +e.target.value)}
              />
            </Field>
            <Field label="Base Menor / Topo Padrão (m)">
              <Input
                type="number"
                step="0.1"
                value={form.preferencias.leiraBaseMenorPadrao}
                onChange={(e) => setPref('leiraBaseMenorPadrao', +e.target.value)}
              />
            </Field>
            <Field label="Base Maior / Fundo Padrão (m)">
              <Input
                type="number"
                step="0.1"
                value={form.preferencias.leiraBaseMaiorPadrao}
                onChange={(e) => setPref('leiraBaseMaiorPadrao', +e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="submit" className="btn-primary px-6 py-2.5">
            <Save className="h-4 w-4" /> Salvar Alterações do Perfil
          </button>
        </div>
      </form>
    </div>
  );
}
