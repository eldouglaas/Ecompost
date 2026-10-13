import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FlaskConical,
  Layers,
  Plus,
  Printer,
  Ruler,
  Scale,
  Thermometer,
  Trash2,
  X,
} from 'lucide-react';
import { Field, Input, Select } from '../components/ui';
import { brl, num, uid, useStore } from '../store/store';
import { ItemReceitaComposto, Orcamento } from '../types';
import {
  calculateAreaSecaoLeira,
  calculateExtensaoTotalLeiras,
  calculateFinanceiro,
  calculateNrLeiras,
  calculateReceitaMetrics,
} from '../utils/agronomyCalculations';

const steps = [
  'Dados do Cliente',
  'Tamanho e Dose',
  'Receita do Composto',
  'Custos',
  'Conferir Tudo',
];

const CHART_PALETTE = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#6366f1',
  '#14b8a6',
];

// Medidor semicircular SVG da Relação C:N (Idêntico ao VSe do Base44)
function CNGaugeSvg({ value }: { value: number }) {
  const clamped = Math.max(10, Math.min(50, Number(value) || 0));
  const angleFor = (v: number) => 180 - ((v - 10) / 40) * 180;
  const r = 78;
  const cx = 100;
  const cy = 100;
  const ptOnArc = (v: number, radius = r): [number, number] => {
    const rad = (angleFor(v) * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy - radius * Math.sin(rad)];
  };
  const arcPath = (vStart: number, vEnd: number, radius = r) => {
    const [x1, y1] = ptOnArc(vStart, radius);
    const [x2, y2] = ptOnArc(vEnd, radius);
    const largeArc = Math.abs(angleFor(vStart) - angleFor(vEnd)) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };
  const [nx, ny] = ptOnArc(clamped, r - 16);
  const needleColor = value >= 25 && value <= 30 ? '#10b981' : '#f59e0b';

  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[250px]">
      <path
        d={arcPath(10, 50)}
        stroke="#e2e8f0"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={arcPath(25, 30)}
        stroke="#10b981"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        opacity="0.45"
      />
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={needleColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="5" fill="#1e293b" />
      <text
        x={cx}
        y={cy - 24}
        textAnchor="middle"
        style={{ fontSize: 26, fontWeight: 700 }}
        fill="currentColor"
      >
        {value > 0 ? num(value, 1) : '—'}
      </text>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        style={{ fontSize: 9 }}
        fill="#64748b"
      >
        C:N :1
      </text>
      <text x={10} y={108} style={{ fontSize: 8.5 }} fill="#64748b">
        10
      </text>
      <text x={188} y={108} textAnchor="end" style={{ fontSize: 8.5 }} fill="#64748b">
        50
      </text>
    </svg>
  );
}

// Diagrama Técnico 2D da Seção Trapezoidal da Leira
export function WindrowCrossSectionDiagram({
  alturaM,
  baseMenorM,
  baseMaiorM,
  secaoM2,
  extensaoLeiraM,
  nrLeiras,
}: {
  alturaM: number;
  baseMenorM: number;
  baseMaiorM: number;
  secaoM2: number;
  extensaoLeiraM: number;
  nrLeiras: number;
}) {
  return (
    <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
          <Ruler className="h-4 w-4 text-blue-600" />
          Geometria da Seção Trapezoidal da Leira (Corte Transversal)
        </div>
        <span className="rounded-full bg-blue-600/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
          Área da Seção = {num(secaoM2, 2)} m²
        </span>
      </div>
      <div className="grid items-center gap-4 md:grid-cols-2">
        <svg viewBox="0 0 360 155" className="w-full max-w-[360px] mx-auto">
          {/* Solo */}
          <line x1="20" x2="340" y1="125" y2="125" stroke="#64748b" strokeWidth="2" />
          {/* Trapézio em camadas (Lasanha Agronômica) */}
          {/* Camada 1: Base Carbono/Palhada */}
          <polygon
            points="50,125 310,125 282,92 78,92"
            fill="#d97706"
            fillOpacity="0.28"
          />
          {/* Camada 2: Intermediária Esterco/Cama */}
          <polygon
            points="78,92 282,92 254,60 106,60"
            fill="#16a34a"
            fillOpacity="0.28"
          />
          {/* Camada 3: Topo & Minerais */}
          <polygon
            points="106,60 254,60 230,32 130,32"
            fill="#2563eb"
            fillOpacity="0.25"
          />
          {/* Contorno do Trapézio */}
          <polygon
            points="50,125 310,125 230,32 130,32"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="2.5"
          />
          {/* Linha de Altura h */}
          <line
            x1="180"
            x2="180"
            y1="32"
            y2="125"
            stroke="#dc2626"
            strokeDasharray="3 3"
            strokeWidth="1.8"
          />
          <text
            x="186"
            y="82"
            fontSize="10.5"
            fontWeight="700"
            fill="#dc2626"
          >
            h = {num(alturaM, 2)} m
          </text>
          {/* Rótulo Base Menor */}
          <text
            x="180"
            y="23"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fill="#1e40af"
          >
            Base Menor (b) = {num(baseMenorM, 2)} m
          </text>
          {/* Rótulo Base Maior */}
          <text
            x="180"
            y="143"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fill="#1e293b"
          >
            Base Maior (B) = {num(baseMaiorM, 2)} m
          </text>
        </svg>

        <div className="space-y-2 text-xs">
          <div className="rounded-xl bg-white/80 p-3 border border-blue-100 dark:bg-slate-900/70 dark:border-slate-800">
            <div className="font-bold text-slate-800 dark:text-slate-100">
              Fórmula Agronômica do Trapézio:
            </div>
            <div className="mt-1 font-mono text-[11px] text-blue-700 dark:text-blue-300">
              Seção = ((B + b) ÷ 2) × h = (({num(baseMaiorM, 2)} + {num(baseMenorM, 2)}) ÷ 2) ×{' '}
              {num(alturaM, 2)} = <b>{num(secaoM2, 2)} m²</b>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/80 p-2.5 border border-blue-100 dark:bg-slate-900/70 dark:border-slate-800">
              <div className="text-[10px] uppercase text-slate-400">Volume por Leira ({num(extensaoLeiraM, 0)}m)</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {num(secaoM2 * extensaoLeiraM, 1)} m³ / leira
              </div>
            </div>
            <div className="rounded-xl bg-white/80 p-2.5 border border-blue-100 dark:bg-slate-900/70 dark:border-slate-800">
              <div className="text-[10px] uppercase text-slate-400">Total de Leiras no Pátio</div>
              <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                {num(nrLeiras, 1)} leiras
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrcamentoWizard() {
  const { id } = useParams();
  const nav = useNavigate();
  const {
    clientes,
    produtos,
    orcamentos,
    saveOrcamento,
    nextOrcamentoNumero,
    userProfile,
  } = useStore();

  const blank = (numero: number): Orcamento => ({
    id: uid(),
    numero,
    data: new Date().toISOString().slice(0, 10),
    clienteId: '',
    clienteNome: '',
    consultor: userProfile?.preferencias?.consultorPadrao || 'Equipe Ecompost',
    propriedade: '',
    descricao: '',
    umidadeFinalPct: userProfile?.preferencias?.umidadeFinalPadrao || 30,
    doseCompostoTnHa: 6,
    areaHa: 100,
    pesoFinalTn: 600,
    leiraAlturaM: userProfile?.preferencias?.leiraAlturaPadrao || 1.8,
    leiraBaseMenorM: userProfile?.preferencias?.leiraBaseMenorPadrao || 2.0,
    leiraBaseMaiorM: userProfile?.preferencias?.leiraBaseMaiorPadrao || 6.0,
    leiraExtensaoM: userProfile?.preferencias?.leiraExtensaoPadrao || 120.0,
    secaoM2: 7.2,
    extensaoTotalM: 0,
    nrLeiras: 0,
    itens: [],
    relacaoCN: 0,
    carbonoTotalTn: 0,
    nitrogenioTotalTn: 0,
    densidadeMedia: 0.72,
    massaSecaInicialTn: 0,
    massaSecaFinalTn: 0,
    massaSugeridaMetaTn: 0,
    eficienciaPct: 0,
    perdaMineralizacaoTn: 0,
    cicloDias: 60,
    custoOperacionalPorTn: 40,
    assessoriaTotal: 0,
    locacaoEquipamentos: 0,
    custoProdutos: 0,
    custoTotal: 0,
    valorPorTn: 0,
    valorPorHa: 0,
    situacao: 'Aberto',
  });

  const [step, setStep] = useState(0);
  const [o, setO] = useState<Orcamento>(
    () => orcamentos.find((x) => x.id === id) ?? blank(nextOrcamentoNumero())
  );
  const [montagemModalOpen, setMontagemModalOpen] = useState(false);
  const [conchaM3, setConchaM3] = useState<number>(
    userProfile?.preferencias?.capacidadeConchaM3 || 1.5
  );

  // Cálculos exatos via motor G6 (agronomyCalculations.ts)
  const d = useMemo(() => {
    const peso = +(o.doseCompostoTnHa * o.areaHa).toFixed(2);
    const secao = calculateAreaSecaoLeira(
      o.leiraBaseMaiorM,
      o.leiraBaseMenorM,
      o.leiraAlturaM
    );
    const m = calculateReceitaMetrics(
      o.itens,
      produtos,
      peso,
      o.umidadeFinalPct,
      secao,
      o.areaHa,
      o.doseCompostoTnHa
    );
    const extTotal = calculateExtensaoTotalLeiras(m.volumeTotalM3, secao);
    const nr = calculateNrLeiras(extTotal, o.leiraExtensaoM);
    const f = calculateFinanceiro(
      peso,
      o.areaHa,
      o.custoOperacionalPorTn,
      o.assessoriaTotal,
      o.locacaoEquipamentos,
      m.custoProdutos
    );
    return { peso, secao, m, extTotal, nr, f };
  }, [o, produtos]);

  const set = <K extends keyof Orcamento>(k: K, v: Orcamento[K]) =>
    setO((p) => ({ ...p, [k]: v }));

  const updateItem = (itemId: string, patch: Partial<ItemReceitaComposto>) =>
    setO((p) => ({
      ...p,
      itens: p.itens.map((it) => {
        if (it.id !== itemId) return it;
        const n = { ...it, ...patch };
        if (patch.produtoId) {
          const pr = produtos.find((x) => x.id === patch.produtoId);
          if (pr) {
            Object.assign(n, {
              produtoNome: pr.nome,
              tipo: pr.tipo,
              umidadePct: pr.umidadePct,
              valorUnitario: pr.valorUnitario,
            });
          }
        }
        n.massaSecaTn = +(n.quantidadeTn * (1 - n.umidadePct / 100)).toFixed(2);
        n.subtotal = +(n.quantidadeTn * n.valorUnitario).toFixed(2);
        return n;
      }),
    }));

  const addItem = () => {
    const pr = produtos[0];
    if (!pr) return;
    setO((p) => ({
      ...p,
      itens: [
        ...p.itens,
        {
          id: uid(),
          produtoId: pr.id,
          produtoNome: pr.nome,
          tipo: pr.tipo,
          quantidadeTn: 100,
          umidadePct: pr.umidadePct,
          massaSecaTn: +(100 * (1 - pr.umidadePct / 100)).toFixed(2),
          percentual: 0,
          valorUnitario: pr.valorUnitario,
          subtotal: +(100 * pr.valorUnitario).toFixed(2),
        },
      ],
    }));
  };

  const totalCusto = d.m.custoProdutos;
  const canNext =
    step === 0 ? !!o.clienteId : step === 2 ? o.itens.length > 0 : true;

  const buildUpdatedOrcamento = (): Orcamento => {
    return {
      ...o,
      itens: d.m.itensComRateio,
      pesoFinalTn: d.peso,
      secaoM2: d.secao,
      extensaoTotalM: Number(d.extTotal.toFixed(2)),
      nrLeiras: Number(d.nr.toFixed(2)),
      relacaoCN: d.m.relacaoCN,
      statusCN: d.m.statusCN,
      carbonoTotalTn: d.m.carbonoTotal,
      nitrogenioTotalTn: d.m.nitrogenioTotal,
      densidadeMedia: d.m.densidadeMedia,
      massaSecaInicialTn: d.m.massaSecaInicial,
      massaSecaFinalTn: d.m.massaSecaFinal,
      massaSugeridaMetaTn: d.m.massaSugeridaMeta,
      eficienciaPct: d.m.eficienciaPct,
      perdaMineralizacaoTn: d.m.perdaMineralizacaoTn,
      perdaMassaPct: d.m.perdaMassaPct,
      cicloDias: d.m.cicloDias,
      custoProdutos: d.m.custoProdutos,
      custoTotal: d.f.custoTotal,
      valorPorTn: d.f.valorPorTn,
      valorPorHa: d.f.valorPorHa,
    };
  };

  const save = () => {
    const updated = buildUpdatedOrcamento();
    saveOrcamento(updated);
    nav(`/orcamentos/${o.id}/relatorio`);
  };

  const cn = d.m.relacaoCN;
  const cnOk = cn >= 25 && cn <= 30;
  const cnMsg =
    cn <= 0
      ? 'Adicione ingredientes e informe N/C'
      : cnOk
      ? 'Faixa ideal (25–30:1)'
      : cn < 25
      ? 'Déficit de carbono — adicione material rico em C (palha, serragem)'
      : 'Excesso de carbono — decomposição lenta, adicione material nitrogenado';

  const diasCiclo = d.m.cicloDias || 0;
  const diasMesofilo = Math.round(diasCiclo * 0.08);
  const diasTermofilo = Math.round(diasCiclo * 0.37);
  const diasMaturacao = Math.round(diasCiclo * 0.55);

  const ro = { background: 'var(--bg-card-subtle)' };

  return (
    <div>
      {/* Header & Ações da Leira/Projeto */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav('/orcamentos')}
            className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5"
            title="Voltar para Orçamentos"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">
              {id ? `Orçamento #${o.numero}` : 'Novo Orçamento'}
            </h1>
            {o.clienteNome && (
              <p className="text-xs text-slate-500">
                {o.clienteNome}
                {o.propriedade ? ` · ${o.propriedade}` : ''}
              </p>
            )}
          </div>
        </div>
        {id && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMontagemModalOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
              title="Abrir planejamento de Montagem da Leira (Kg/m e Conchas)"
            >
              <Ruler className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Montagem da Leira
            </button>
            <button
              type="button"
              onClick={() => nav(`/orcamentos/${o.id}/monitoramento`)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300"
              title="Lançar temperaturas e acompanhar gráfico das leiras"
            >
              <Thermometer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Monitoramento de Leira
            </button>
            <button
              type="button"
              onClick={() => nav(`/orcamentos/${o.id}/relatorio`)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              title="Abrir Relatórios Individuais"
            >
              <Printer className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              Relatórios
            </button>
            <button
              type="button"
              onClick={() => nav(`/orcamentos/${o.id}/relatorio?tab=geral`)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              title="Emitir Relatório Geral (Orçamento Completo + Montagem + Monitoramento)"
            >
              <Printer className="h-4 w-4" />
              Relatório Geral (PDF)
            </button>
          </div>
        )}
      </div>

      {/* Stepper */}
      <div className="mb-6 flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => (i <= step || canNext || !!id) && setStep(i)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition"
            style={{
              background:
                i === step
                  ? '#15803d'
                  : i < step
                  ? 'var(--primary-light)'
                  : 'transparent',
              color:
                i === step
                  ? '#fff'
                  : i < step
                  ? 'var(--primary-text)'
                  : 'var(--text-muted)',
            }}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold">
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {/* ================================================================= */}
        {/* STEP 0: DADOS DO CLIENTE                                          */}
        {/* ================================================================= */}
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <h2 className="text-base font-bold">Dados do Cliente</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Conte quem é o cliente e a propriedade onde vai ser feita a compostagem.
              </p>
            </div>
            <Field label="Cliente *">
              <Select
                value={o.clienteId}
                onChange={(e) =>
                  setO({
                    ...o,
                    clienteId: e.target.value,
                    clienteNome:
                      clientes.find((c) => c.id === e.target.value)?.nome || '',
                  })
                }
              >
                <option value="">- Selecione</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data">
              <Input
                type="date"
                value={o.data}
                onChange={(e) => set('data', e.target.value)}
              />
            </Field>
            <Field label="Consultor">
              <Input
                value={o.consultor}
                onChange={(e) => set('consultor', e.target.value)}
              />
            </Field>
            <Field label="Propriedade">
              <Input
                value={o.propriedade}
                onChange={(e) => set('propriedade', e.target.value)}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Descrição">
                <Input
                  value={o.descricao}
                  onChange={(e) => set('descricao', e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 1: TAMANHO DA ÁREA E DOSE                                    */}
        {/* ================================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold">Tamanho da Área e Dose</h2>
              <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                Quantos hectares vão receber o composto e quanto vai por hectare.
              </p>
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Umidade Final (%)">
                  <Select
                    value={o.umidadeFinalPct}
                    onChange={(e) => set('umidadeFinalPct', +e.target.value)}
                  >
                    {[20, 25, 30, 35, 40, 45, 50].map((v) => (
                      <option key={v} value={v}>
                        {v}%
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Dose Composto (tn/ha)">
                  <Input
                    type="number"
                    step="any"
                    value={o.doseCompostoTnHa}
                    onChange={(e) => set('doseCompostoTnHa', +e.target.value)}
                  />
                </Field>
                <Field label="Área (ha)">
                  <Input
                    type="number"
                    step="any"
                    value={o.areaHa}
                    onChange={(e) => set('areaHa', +e.target.value)}
                  />
                </Field>
                <Field label="Peso Final (tn)">
                  <Input disabled style={ro} value={num(d.peso)} readOnly />
                </Field>
              </div>
            </div>

            <div className="border-t pt-5" style={{ borderColor: 'var(--border-card)' }}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold">Tamanho e Geometria das Leiras</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Como vai ser a leira no campo — altura e largura da base (seção trapezoidal).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMontagemModalOpen(true)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    <Ruler className="h-3.5 w-3.5" /> Planejamento de Montagem (Kg/m)
                  </button>
                  {id && (
                    <button
                      type="button"
                      onClick={() => nav(`/orcamentos/${o.id}/monitoramento`)}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                      <Thermometer className="h-3.5 w-3.5" /> Monitorar Leiras
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Altura (m)">
                  <Input
                    type="number"
                    step="any"
                    value={o.leiraAlturaM}
                    onChange={(e) => set('leiraAlturaM', +e.target.value)}
                  />
                </Field>
                <Field label="Base Menor (m)">
                  <Input
                    type="number"
                    step="any"
                    value={o.leiraBaseMenorM}
                    onChange={(e) => set('leiraBaseMenorM', +e.target.value)}
                  />
                </Field>
                <Field label="Base Maior (m)">
                  <Input
                    type="number"
                    step="any"
                    value={o.leiraBaseMaiorM}
                    onChange={(e) => set('leiraBaseMaiorM', +e.target.value)}
                  />
                </Field>
                <Field label="Extensão por Leira (m)">
                  <Input
                    type="number"
                    step="any"
                    value={o.leiraExtensaoM}
                    onChange={(e) => set('leiraExtensaoM', +e.target.value)}
                  />
                </Field>
                <Field label="Seção (m²)">
                  <Input disabled value={num(d.secao)} readOnly />
                </Field>
                <Field label="Extensão Total (m)">
                  <Input disabled value={num(d.extTotal, 2)} readOnly />
                </Field>
                <Field label="Nr. Leiras">
                  <Input disabled value={num(d.nr, 2)} readOnly />
                </Field>
              </div>
            </div>

            <WindrowCrossSectionDiagram
              alturaM={o.leiraAlturaM}
              baseMenorM={o.leiraBaseMenorM}
              baseMaiorM={o.leiraBaseMaiorM}
              secaoM2={d.secao}
              extensaoLeiraM={o.leiraExtensaoM}
              nrLeiras={d.nr}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: RECEITA DO COMPOSTO & ENGENHARIA (Fiel ao pD + cD Base44) */}
        {/* ================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold">Receita do Composto</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Escolha os ingredientes e quanto vai de cada um. Total:{' '}
                  <b>{brl(totalCusto)}</b>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMontagemModalOpen(true)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  <Ruler className="h-3.5 w-3.5" /> Montagem da Leira (Kg/m)
                </button>
                <button type="button" className="btn-primary h-9 text-xs" onClick={addItem}>
                  <Plus className="h-4 w-4" /> Adicionar Ingrediente
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ingrediente</th>
                    <th>Tipo</th>
                    <th className="text-right">Mat. Original (tn)</th>
                    <th className="text-right">Mat. Seca (tn)</th>
                    <th className="text-right">Particip. (%)</th>
                    <th className="text-right">Kg / m Leira</th>
                    <th className="text-right">Valor/tn</th>
                    <th className="text-right">Total</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {d.m.itensComRateio.map((it) => (
                    <tr key={it.id}>
                      <td style={{ minWidth: 220 }}>
                        <Select
                          value={it.produtoId}
                          onChange={(e) =>
                            updateItem(it.id, { produtoId: e.target.value })
                          }
                        >
                          {produtos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome}
                              {p.clienteNome ? ` · ${p.clienteNome}` : ''} ({p.unidade})
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            it.tipo === 'Orgânico'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                              : it.tipo === 'Mineral'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                          }`}
                        >
                          {it.tipo}
                        </span>
                      </td>
                      <td style={{ width: 120 }}>
                        <Input
                          type="number"
                          step="any"
                          className="text-right"
                          value={it.quantidadeTn}
                          onChange={(e) =>
                            updateItem(it.id, { quantidadeTn: +e.target.value })
                          }
                        />
                      </td>
                      <td className="text-right">{num(it.massaSecaTn)}</td>
                      <td
                        className="text-right font-semibold"
                        style={{ color: '#16a34a' }}
                      >
                        {num(it.percentual)}%
                      </td>
                      <td className="text-right font-semibold text-blue-600 dark:text-blue-400">
                        {num(it.kgPorMetro || 0)} kg/m
                      </td>
                      <td className="text-right">{brl(it.valorUnitario)}</td>
                      <td className="text-right font-bold">{brl(it.subtotal)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            setO({
                              ...o,
                              itens: o.itens.filter((x) => x.id !== it.id),
                            })
                          }
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {o.itens.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Clique em &ldquo;Adicionar Ingrediente&rdquo; para montar a receita do composto.
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 font-bold">
                    <td colSpan={2}>Totais</td>
                    <td className="text-right">{num(d.m.massaTotalOriginal)}</td>
                    <td className="text-right">{num(d.m.massaSecaInicial)}</td>
                    <td className="text-right text-emerald-600">100,00%</td>
                    <td className="text-right text-blue-600">
                      {num(d.m.totalKgPorMetro)} kg/m
                    </td>
                    <td />
                    <td className="text-right">{brl(totalCusto)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ENGENHARIA DO COMPOSTO (Fiel ao componente cD do Base44) */}
            {o.itens.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold">Engenharia do Composto</h3>
                  <span className="text-xs text-slate-400">— visão do agrônomo</span>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${
                    cnOk
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-amber-500/30 bg-amber-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Relação Carbono:Nitrogênio
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-4xl font-bold">
                          {cn > 0 ? num(cn, 1) : '—'}
                        </span>
                        <span className="text-lg text-slate-400">:1</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-sm font-medium">
                        {cnOk ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span
                          className={
                            cnOk
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }
                        >
                          {cnMsg}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        Faixa ideal
                      </div>
                      <div className="mt-1 text-sm font-semibold">25–30 : 1</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ['Carbono Total', num(d.m.carbonoTotal), 'tn C'],
                    ['Nitrogênio Total', num(d.m.nitrogenioTotal), 'tn N'],
                    ['Densidade Média', num(d.m.densidadeMedia, 2), 'tn/m³'],
                    ['Massa Seca Inicial', num(d.m.massaSecaInicial), 'tn'],
                  ].map(([l, v, u]) => (
                    <div
                      key={l}
                      className="rounded-xl border p-3.5"
                      style={{
                        borderColor: 'var(--border-card)',
                        background: 'var(--bg-card-subtle)',
                      }}
                    >
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        {l}
                      </div>
                      <div className="mt-1 text-lg font-bold">
                        {v}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          {u}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl border p-4"
                  style={{ borderColor: 'var(--border-card)' }}
                >
                  <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
                    <Scale className="h-3.5 w-3.5 text-emerald-600" /> Balanço de Massa — Mineralização
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: 'var(--border-card)',
                        background: 'var(--bg-card-subtle)',
                      }}
                    >
                      <div className="text-[10px] uppercase text-slate-400">
                        Massa Seca Final
                      </div>
                      <div className="text-lg font-bold">
                        {num(d.m.massaSecaFinal)}{' '}
                        <span className="text-xs font-normal text-slate-400">tn</span>
                      </div>
                    </div>
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: 'var(--border-card)',
                        background: 'var(--bg-card-subtle)',
                      }}
                    >
                      <div className="text-[10px] uppercase text-slate-400">
                        Sugerida p/ meta
                      </div>
                      <div className="text-lg font-bold">
                        {num(d.m.massaSugeridaMeta)}{' '}
                        <span className="text-xs font-normal text-slate-400">tn</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ~60% de eficiência
                      </div>
                    </div>
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: 'var(--border-card)',
                        background: 'var(--bg-card-subtle)',
                      }}
                    >
                      <div className="text-[10px] uppercase text-slate-400">
                        Eficiência
                      </div>
                      <div className="text-lg font-bold">
                        {num(d.m.eficienciaPct, 0)}{' '}
                        <span className="text-xs font-normal text-slate-400">%</span>
                      </div>
                    </div>
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: 'var(--border-card)',
                        background: 'var(--bg-card-subtle)',
                      }}
                    >
                      <div className="text-[10px] uppercase text-slate-400">
                        Perda por Mineralização
                      </div>
                      <div className="text-lg font-bold">
                        {num(d.m.perdaMineralizacaoTn)}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          tn ({num(d.m.perdaMassaPct, 0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl border p-4"
                  style={{ borderColor: 'var(--border-card)' }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs font-semibold">Ciclo de Compostagem</div>
                    <span className="text-sm font-bold">
                      {diasCiclo > 0 ? `${diasCiclo} dias` : '—'}
                    </span>
                  </div>
                  <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-blue-400"
                      style={{ width: '8%' }}
                      title="Mesófilo"
                    />
                    <div
                      className="bg-amber-500"
                      style={{ width: '37%' }}
                      title="Termófilo"
                    />
                    <div
                      className="bg-emerald-500"
                      style={{ width: '55%' }}
                      title="Maturação"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-400" />
                      Mesófilo · <b>{diasMesofilo}d</b>
                      <div className="text-slate-400">20–45 °C</div>
                    </div>
                    <div>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
                      Termófilo · <b>{diasTermofilo}d</b>
                      <div className="text-slate-400">45–70 °C</div>
                    </div>
                    <div>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      Maturação · <b>{diasMaturacao}d</b>
                      <div className="text-slate-400">~ambiental</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: CUSTOS DO PROJETO                                         */}
        {/* ================================================================= */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-bold">Custos do Projeto</h2>
            <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              Quanto custa a mão de obra, a assessoria e os equipamentos.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Custo Operacional (R$/tn)">
                <Input
                  type="number"
                  step="any"
                  value={o.custoOperacionalPorTn}
                  onChange={(e) => set('custoOperacionalPorTn', +e.target.value)}
                />
              </Field>
              <Field label="Assessoria (R$)">
                <Input
                  type="number"
                  step="any"
                  value={o.assessoriaTotal}
                  onChange={(e) => set('assessoriaTotal', +e.target.value)}
                />
              </Field>
              <Field label="Locação Equipamentos (R$)">
                <Input
                  type="number"
                  step="any"
                  value={o.locacaoEquipamentos}
                  onChange={(e) => set('locacaoEquipamentos', +e.target.value)}
                />
              </Field>
              <Field label="Custo Produtos (R$)">
                <Input disabled value={brl(d.m.custoProdutos)} readOnly />
              </Field>
              <Field label="Custo Total (R$)">
                <Input disabled value={brl(d.f.custoTotal)} readOnly />
              </Field>
              <Field label="Situação">
                <Select
                  value={o.situacao}
                  onChange={(e) =>
                    set('situacao', e.target.value as Orcamento['situacao'])
                  }
                >
                  <option>Aberto</option>
                  <option>Aprovado</option>
                  <option>Cancelado</option>
                </Select>
              </Field>
              <div className="md:col-span-1">
                <Field label="Valor / TN">
                  <Input disabled value={brl(d.f.valorPorTn)} readOnly />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Valor / HA">
                  <Input disabled value={brl(d.f.valorPorHa)} readOnly />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: CONFERIR TUDO (Fiel ao WSe + VSe do Base44)               */}
        {/* ================================================================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold">Conferir Tudo Antes de Salvar</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Veja se está tudo certo. Depois é só salvar o projeto.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Field label="Cliente">
                <Input disabled value={o.clienteNome || '—'} readOnly />
              </Field>
              <Field label="Propriedade">
                <Input disabled value={o.propriedade || '—'} readOnly />
              </Field>
              <Field label="Consultor">
                <Input disabled value={o.consultor || '—'} readOnly />
              </Field>
              <Field label="Data">
                <Input
                  disabled
                  value={o.data.split('-').reverse().join('/')}
                  readOnly
                />
              </Field>
              <Field label="Área (ha)">
                <Input disabled value={num(o.areaHa)} readOnly />
              </Field>
              <Field label="Dose (tn/ha)">
                <Input disabled value={num(o.doseCompostoTnHa, 3)} readOnly />
              </Field>
              <Field label="Peso Final (tn)">
                <Input disabled value={num(d.peso)} readOnly />
              </Field>
              <Field label="Nr. Leiras">
                <Input disabled value={num(d.nr, 2)} readOnly />
              </Field>
            </div>

            {/* COMPOSIÇÃO DO COMPOSTO — O DNA DA MISTURA (WSe do Base44) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-emerald-600" />
                <h3 className="text-sm font-bold">Composição do Composto</h3>
                <span className="text-xs text-slate-400">— o DNA da mistura</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Medidor C:N (VSe) */}
                <div
                  className="flex flex-col items-center justify-center rounded-2xl border p-4"
                  style={{
                    borderColor: 'var(--border-card)',
                    background: 'var(--bg-card-subtle)',
                  }}
                >
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
                    Relação C:N
                  </div>
                  <CNGaugeSvg value={cn} />
                  <div className="-mt-2 text-xs text-slate-400">
                    faixa ideal destacada em verde (25–30:1)
                  </div>
                </div>

                {/* Proporção dos Ingredientes */}
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: 'var(--border-card)',
                    background: 'var(--bg-card-subtle)',
                  }}
                >
                  <div className="mb-3 text-[11px] uppercase tracking-wide text-slate-400">
                    Proporção dos Ingredientes (Matéria Seca & Custo)
                  </div>
                  <div className="space-y-2.5">
                    {d.m.itensComRateio.map((it, idx) => {
                      const pctSeca =
                        d.m.massaSecaInicial > 0
                          ? (it.massaSecaTn / d.m.massaSecaInicial) * 100
                          : 0;
                      const color = CHART_PALETTE[idx % CHART_PALETTE.length];
                      return (
                        <div key={it.id}>
                          <div className="flex justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ background: color }}
                              />
                              {it.produtoNome}
                            </span>
                            <span className="text-slate-500">
                              {num(it.massaSecaTn, 0)} tn seca ({num(pctSeca, 1)}%) ·{' '}
                              <b>{num(it.percentual, 1)}% custo</b>
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, pctSeca)}%`,
                                background: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Garantia de Macronutrientes (% no composto) */}
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: 'var(--border-card)',
                  background: 'var(--bg-card-subtle)',
                }}
              >
                <div className="mb-3 text-[11px] uppercase tracking-wide text-slate-400">
                  Garantia de Macronutrientes (% no composto e kg/ha)
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-7">
                  {(
                    [
                      ['n_pct', 'N'],
                      ['p2o5_pct', 'P2O5'],
                      ['k2o_pct', 'K2O'],
                      ['ca_pct', 'Ca'],
                      ['mg_pct', 'Mg'],
                      ['s_pct', 'S'],
                      ['si_pct', 'Si'],
                    ] as const
                  ).map(([key, label], idx) => {
                    const valPct = d.m.garantias[key] || 0;
                    const valKgHa = d.m.kgHaNutrientes[key] || 0;
                    const color = CHART_PALETTE[idx % CHART_PALETTE.length];
                    return (
                      <div
                        key={key}
                        className="rounded-xl border bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                          {label}
                        </div>
                        <div
                          className="mt-1 text-base font-extrabold"
                          style={{ color }}
                        >
                          {num(valPct, 2)}%
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-500">
                          {num(valKgHa, 1)} kg/ha
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-emerald-700 px-6 py-4 text-white">
              <div>
                <div className="text-xs uppercase opacity-80">Total do Projeto</div>
                <div className="text-2xl font-bold">{brl(d.f.custoTotal)}</div>
              </div>
              <div className="text-right text-xs opacity-90">
                <div>{brl(d.f.valorPorTn)} / tn</div>
                <div>{brl(d.f.valorPorHa)} / ha</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div
          className="mt-6 flex justify-between border-t pt-4"
          style={{ borderColor: 'var(--border-card)' }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() => (step === 0 ? nav('/orcamentos') : setStep(step - 1))}
          >
            <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Cancelar' : 'Voltar'}
          </button>
          {step < 4 ? (
            <button
              type="button"
              className="btn-primary disabled:opacity-50"
              disabled={!canNext}
              onClick={() => setStep(step + 1)}
            >
              Avançar <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={save}>
              <Check className="h-4 w-4" /> Salvar Orçamento
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL INTERATIVO: PLANEJAMENTO PARA MONTAGEM DA LEIRA (Campo + PDF)   */}
      {/* ===================================================================== */}
      {montagemModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => setMontagemModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 max-h-[90vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-2 rounded-full bg-blue-600" />
                <div>
                  <h3 className="text-lg font-bold">
                    Planejamento para Montagem da Leira
                  </h3>
                  <p className="text-xs text-slate-500">
                    Guia de distribuição linear (Kg/m), carga por leira ({o.leiraExtensaoM}m) e conchas de pá carregadeira
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = buildUpdatedOrcamento();
                    saveOrcamento(updated);
                    setMontagemModalOpen(false);
                    nav(`/orcamentos/${o.id}/relatorio?tab=montagem`);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Printer className="h-3.5 w-3.5" /> Abrir PDF Oficial de Montagem
                </button>
                <button
                  type="button"
                  onClick={() => setMontagemModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <WindrowCrossSectionDiagram
              alturaM={o.leiraAlturaM}
              baseMenorM={o.leiraBaseMenorM}
              baseMaiorM={o.leiraBaseMaiorM}
              secaoM2={d.secao}
              extensaoLeiraM={o.leiraExtensaoM}
              nrLeiras={d.nr}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <span className="font-bold">Regulagem de Campo (Operador de Pá Carregadeira):</span>{' '}
                Informe o volume da concha para calcular o número de conchas por leira de {o.leiraExtensaoM}m.
              </div>
              <div className="flex items-center gap-2">
                <label className="font-semibold">Concha (m³):</label>
                <input
                  type="number"
                  step="0.1"
                  min={0.2}
                  value={conchaM3}
                  onChange={(e) => setConchaM3(Math.max(0.2, +e.target.value))}
                  className="w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-center font-bold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-slate-100/80 text-[10px] font-bold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-800">
                    <th className="py-2.5 px-3 text-left">Produto</th>
                    <th className="py-2.5 px-3 text-right">Kg / Metro Linear</th>
                    <th className="py-2.5 px-3 text-right">A cada 10m (Kg)</th>
                    <th className="py-2.5 px-3 text-right">
                      Por Leira de {o.leiraExtensaoM}m (tn)
                    </th>
                    <th className="py-2.5 px-3 text-right">
                      Conchas ({num(conchaM3, 1)}m³) / Leira
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {d.m.itensComRateio.map((it) => {
                    const kgM = it.kgPorMetro || 0;
                    const kg10m = kgM * 10;
                    const tnPorLeira = (kgM * o.leiraExtensaoM) / 1000;
                    const prod = produtos.find((p) => p.id === it.produtoId);
                    const dens = prod?.densidadeTnM3 || 0.7;
                    const m3PorLeira = dens > 0 ? tnPorLeira / dens : 0;
                    const conchasPorLeira = conchaM3 > 0 ? m3PorLeira / conchaM3 : 0;
                    return (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3 font-semibold">{it.produtoNome}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-600">
                          {num(kgM, 2)} kg/m
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {num(kg10m, 0)} kg
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold">
                          {num(tnPorLeira, 2)} tn
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                          ~{Math.ceil(conchasPorLeira)} conchas
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 bg-slate-50 font-bold dark:border-slate-700 dark:bg-slate-800/60">
                    <td className="py-2.5 px-3">TOTAL:</td>
                    <td className="py-2.5 px-3 text-right text-blue-600">
                      {num(d.m.totalKgPorMetro, 2)} kg/m
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {num(d.m.totalKgPorMetro * 10, 0)} kg
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {num((d.m.totalKgPorMetro * o.leiraExtensaoM) / 1000, 2)} tn
                    </td>
                    <td className="py-2.5 px-3 text-right" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
