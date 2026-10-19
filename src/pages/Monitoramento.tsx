import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Droplets,
  FileDown,
  FileSpreadsheet,
  Flame,
  Info,
  Layers,
  Plus,
  RefreshCw,
  Ruler,
  Save,
  Thermometer,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { num, uid, useStore } from '../store/store';
import { MedicaoLeiraPonto } from '../types';

// Paleta oficial de 14 cores das leiras no gráfico de monitoramento
export const LEIRA_COLORS = [
  '#16a34a',
  '#2563eb',
  '#f59e0b',
  '#dc2626',
  '#8b5cf6',
  '#0891b2',
  '#db2777',
  '#65a30d',
  '#ea580c',
  '#475569',
  '#0d9488',
  '#7c3aed',
  '#0369a1',
  '#c2410c',
];
export const BASE44_LEIRA_COLORS = LEIRA_COLORS;

export function getLeiraColor(indexOrNumber: number, allLeiras?: number[]): string {
  if (allLeiras && allLeiras.length > 0) {
    const idx = allLeiras.indexOf(indexOrNumber);
    if (idx >= 0) return LEIRA_COLORS[idx % LEIRA_COLORS.length];
  }
  return LEIRA_COLORS[Math.max(0, indexOrNumber - 1) % LEIRA_COLORS.length];
}

// Diagnóstico textual inteligente da maturação das leiras
export function buildMonitoramentoHeadline(medicoes: MedicaoLeiraPonto[]): string | null {
  if (!medicoes || medicoes.length === 0) return null;
  const latestByLeira: Record<number, MedicaoLeiraPonto> = {};
  medicoes.forEach((m) => {
    const numLeira = Number(m.leiraNumero);
    if (!numLeira) return;
    if (!latestByLeira[numLeira] || m.data >= latestByLeira[numLeira].data) {
      latestByLeira[numLeira] = m;
    }
  });

  const ideal: number[] = [];
  const quente: number[] = [];
  const fria: number[] = [];

  Object.values(latestByLeira).forEach((m) => {
    const t = Number(m.media) || 0;
    if (t <= 0) return;
    if (t > 65) quente.push(m.leiraNumero);
    else if (t < 45) fria.push(m.leiraNumero);
    else ideal.push(m.leiraNumero);
  });

  const parts: string[] = [];
  if (ideal.length > 0) {
    parts.push(
      `${ideal.length === 1 ? 'Leira' : 'Leiras'} ${ideal.join(', ')} na faixa ideal`
    );
  }
  if (quente.length > 0) {
    parts.push(
      `${quente.length === 1 ? 'Leira' : 'Leiras'} ${quente.join(', ')} acima de 65°C`
    );
  }
  if (fria.length > 0) {
    parts.push(
      `${fria.length === 1 ? 'Leira' : 'Leiras'} ${fria.join(', ')} abaixo da faixa`
    );
  }
  return parts.join('; ') || 'Todas as leiras aguardando leitura térmica';
}

interface DailyRow {
  leira: number;
  ponto1: string;
  ponto2: string;
  ponto3: string;
  umidade: string;
  agua_revolvimento: string;
}

export default function Monitoramento() {
  const { id } = useParams();
  const nav = useNavigate();
  const { orcamentos, saveOrcamento } = useStore();
  const o = orcamentos.find((x) => x.id === id);

  const medicoes: MedicaoLeiraPonto[] = useMemo(() => o?.medicoesLeiras || [], [o?.medicoesLeiras]);

  // Datas disponíveis no histórico
  const datasDisponiveis = useMemo(
    () => Array.from(new Set(medicoes.map((m) => m.data))).sort(),
    [medicoes]
  );

  // Inicializa na última data registrada (ex: 2026-10-05) ou hoje
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (datasDisponiveis.length > 0) return datasDisponiveis[datasDisponiveis.length - 1];
    return new Date().toISOString().slice(0, 10);
  });

  // Lista de leiras acompanhadas (igual à lógica do S3e no Base44)
  const leirasAcompanhadas = useMemo(() => {
    const set = new Set<number>();
    const nrPlanejado = Math.max(1, Math.ceil(Number(o?.nrLeiras) || 1));
    if (medicoes.length === 0) {
      for (let i = 1; i <= nrPlanejado; i++) set.add(i);
    } else {
      medicoes.forEach((m) => {
        if (m.leiraNumero > 0) set.add(Number(m.leiraNumero));
      });
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [medicoes, o?.nrLeiras]);

  const [rows, setRows] = useState<DailyRow[]>([]);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Estado do Gráfico Interativo (N3e)
  const [selectedLeiraFilter, setSelectedLeiraFilter] = useState<string>('todas');
  const [hideZeroLeiras, setHideZeroLeiras] = useState<boolean>(false);
  const [hoveredDateIdx, setHoveredDateIdx] = useState<number | null>(null);

  // Modal "Escolher leiras para o PDF" (P3e)
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfSelectedLeiras, setPdfSelectedLeiras] = useState<number[]>([]);

  // Sincroniza a grade diária quando muda a data ou as medições (fiel ao S3e)
  useEffect(() => {
    const newRows: DailyRow[] = leirasAcompanhadas.map((numLeira) => {
      // Se houver mais de um registro para a mesma leira/data, pega o que tem leitura > 0 ou o último
      const matches = medicoes.filter(
        (m) => m.data === selectedDate && Number(m.leiraNumero) === numLeira
      );
      const found = matches.find((m) => m.media > 0) || matches[0];
      return {
        leira: numLeira,
        ponto1: found ? String(found.ponto1) : '',
        ponto2: found ? String(found.ponto2) : '',
        ponto3: found ? String(found.ponto3) : '',
        umidade: found ? String(found.umidadePct) : '',
        agua_revolvimento:
          found && found.aguaRevolvimento !== 'Nenhum' ? found.aguaRevolvimento : '',
      };
    });
    setRows(newRows);
  }, [selectedDate, leirasAcompanhadas, medicoes]);

  if (!o) {
    return (
      <div className="p-8">
        Orçamento não encontrado.{' '}
        <Link to="/orcamentos" className="text-emerald-600 underline">
          Voltar
        </Link>
      </div>
    );
  }

  const calcRowMedia = (r: DailyRow): number => {
    const vals = [r.ponto1, r.ponto2, r.ponto3]
      .map((v) => parseFloat(String(v).replace(',', '.')))
      .filter((v) => !isNaN(v) && v > 0);
    if (vals.length === 0) {
      // Se digitou 0 nos 3 pontos
      return 0;
    }
    // No Base44, a média é (p1 + p2 + p3) / 3
    const p1 = parseFloat(String(r.ponto1).replace(',', '.')) || 0;
    const p2 = parseFloat(String(r.ponto2).replace(',', '.')) || 0;
    const p3 = parseFloat(String(r.ponto3).replace(',', '.')) || 0;
    return Number(((p1 + p2 + p3) / 3).toFixed(1));
  };

  const updateRow = (idx: number, field: keyof DailyRow, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleAddLeiraRow = () => {
    const nextNum = rows.length > 0 ? Math.max(...rows.map((r) => r.leira)) + 1 : 1;
    setRows((prev) => [
      ...prev,
      {
        leira: nextNum,
        ponto1: '',
        ponto2: '',
        ponto3: '',
        umidade: '',
        agua_revolvimento: '',
      },
    ]);
  };

  const handleSaveDay = () => {
    // Mantém medições de outros dias e substitui/atualiza as do dia selecionado
    const otherDays = medicoes.filter((m) => m.data !== selectedDate);
    const dayRecords: MedicaoLeiraPonto[] = rows
      .filter(
        (r) =>
          r.ponto1 !== '' ||
          r.ponto2 !== '' ||
          r.ponto3 !== '' ||
          r.umidade !== '' ||
          r.agua_revolvimento.trim() !== ''
      )
      .map((r) => {
        const p1 = parseFloat(String(r.ponto1).replace(',', '.')) || 0;
        const p2 = parseFloat(String(r.ponto2).replace(',', '.')) || 0;
        const p3 = parseFloat(String(r.ponto3).replace(',', '.')) || 0;
        const media = Number(((p1 + p2 + p3) / 3).toFixed(1));
        const umid = parseFloat(String(r.umidade).replace(',', '.')) || 0;
        return {
          id: uid(),
          data: selectedDate,
          leiraNumero: r.leira,
          ponto1: p1,
          ponto2: p2,
          p3: p3,
          ponto3: p3,
          media,
          umidadePct: umid,
          aguaRevolvimento: r.agua_revolvimento.trim() || 'Nenhum',
        };
      });

    const combined = [...otherDays, ...dayRecords].sort((a, b) =>
      a.data === b.data ? a.leiraNumero - b.leiraNumero : a.data.localeCompare(b.data)
    );

    saveOrcamento({
      ...o,
      medicoesLeiras: combined,
    });

    setSavedToast(
      `Medições do dia ${selectedDate.split('-').reverse().join('/')} salvas com sucesso!`
    );
    setTimeout(() => setSavedToast(null), 3500);
  };

  const removeMedicao = (mid: string) => {
    saveOrcamento({
      ...o,
      medicoesLeiras: medicoes.filter((m) => m.id !== mid),
    });
  };

  // Exportar CSV idêntico à função k3e do Base44
  const handleExportCsv = () => {
    const header =
      'DATA;LEIRA;PONTO 1;PONTO 2;PONTO 3;MÉDIA;UMIDADE;ÁGUA E REVOLVIMENTO\n';
    const sorted = [...medicoes].sort((a, b) =>
      a.data === b.data ? a.leiraNumero - b.leiraNumero : a.data.localeCompare(b.data)
    );
    const body = sorted
      .map(
        (m) =>
          `${m.data.split('-').reverse().join('/')};${m.leiraNumero};${m.ponto1};${m.ponto2};${
            m.ponto3
          };${m.media};${m.umidadePct}%;${
            m.aguaRevolvimento === 'Nenhum' ? '' : m.aguaRevolvimento
          }`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + body], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Monitoramento_${o.numero || o.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar CSV
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split('\n');
      const novas: MedicaoLeiraPonto[] = [];
      lines.slice(1).forEach((line) => {
        const parts = line.split(';');
        if (parts.length >= 6) {
          const rawData = parts[0]?.trim();
          if (!rawData) return;
          const dParts = rawData.split('/');
          const isoDate =
            dParts.length === 3 ? `${dParts[2]}-${dParts[1]}-${dParts[0]}` : rawData;
          const leira = parseInt(parts[1]?.trim() || '0', 10);
          const p1 = parseFloat(parts[2]?.replace(',', '.') || '0');
          const p2 = parseFloat(parts[3]?.replace(',', '.') || '0');
          const p3 = parseFloat(parts[4]?.replace(',', '.') || '0');
          const med = parseFloat(parts[5]?.replace(',', '.') || '0');
          const umid = parseFloat(
            parts[6]?.replace('%', '').replace(',', '.') || '0'
          );
          const ar = parts[7]?.trim() || 'Nenhum';

          if (leira > 0) {
            novas.push({
              id: uid(),
              data: isoDate,
              leiraNumero: leira,
              ponto1: p1,
              ponto2: p2,
              ponto3: p3,
              media: med > 0 ? med : Number(((p1 + p2 + p3) / 3).toFixed(1)),
              umidadePct: umid,
              aguaRevolvimento: ar || 'Nenhum',
            });
          }
        }
      });
      if (novas.length > 0) {
        saveOrcamento({
          ...o,
          medicoesLeiras: novas,
        });
        setSavedToast(`${novas.length} medições importadas com sucesso via CSV!`);
        setTimeout(() => setSavedToast(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  // Preparação dos dados do Gráfico (idêntico ao N3e do Base44)
  const leirasNoGrafico = useMemo(() => {
    const all = Array.from(new Set(medicoes.map((m) => Number(m.leiraNumero)).filter(Boolean))).sort(
      (a, b) => a - b
    );
    if (!hideZeroLeiras) return all;
    return all.filter((numLeira) =>
      medicoes.some((m) => Number(m.leiraNumero) === numLeira && m.media > 0)
    );
  }, [medicoes, hideZeroLeiras]);

  const leirasVisiveis = useMemo(() => {
    if (selectedLeiraFilter === 'todas') return leirasNoGrafico;
    const n = Number(selectedLeiraFilter);
    return leirasNoGrafico.includes(n) ? [n] : leirasNoGrafico;
  }, [selectedLeiraFilter, leirasNoGrafico]);

  const chartSeriesByDate = useMemo(() => {
    return datasDisponiveis.map((dt) => {
      const valuesByLeira: Record<
        number,
        { media: number; p1: number; p2: number; p3: number; umid: number; acao: string }
      > = {};
      medicoes
        .filter((m) => m.data === dt)
        .forEach((m) => {
          const ln = Number(m.leiraNumero);
          // Prioriza leitura com média > 0 caso haja duplicata no mesmo dia
          if (!valuesByLeira[ln] || m.media > valuesByLeira[ln].media) {
            valuesByLeira[ln] = {
              media: Number(m.media) || 0,
              p1: Number(m.ponto1) || 0,
              p2: Number(m.ponto2) || 0,
              p3: Number(m.ponto3) || 0,
              umid: Number(m.umidadePct) || 0,
              acao: m.aguaRevolvimento,
            };
          }
        });
      return {
        dataIso: dt,
        label: dt.slice(5).split('-').reverse().join('/'),
        fullDate: dt.split('-').reverse().join('/'),
        valuesByLeira,
      };
    });
  }, [datasDisponiveis, medicoes]);

  const headline = useMemo(() => buildMonitoramentoHeadline(medicoes), [medicoes]);

  // Estatísticas da Conclusão do Ciclo (fiel ao O3e do Base44)
  const stats = useMemo(() => {
    const comTemp = medicoes.filter((m) => (Number(m.media) || 0) > 0);
    const base = comTemp.length > 0 ? comTemp : medicoes;
    const total = base.length;
    const ideal = base.filter((m) => m.media >= 45 && m.media <= 65).length;
    const quente = base.filter((m) => m.media > 65).length;
    const fria = base.filter((m) => m.media > 0 && m.media < 45).length;
    const max = base.reduce((acc, m) => Math.max(acc, Number(m.media) || 0), 0);
    const diasUnicosIdeal = new Set(
      base.filter((m) => m.media >= 45 && m.media <= 65).map((m) => m.data)
    ).size;
    return {
      total,
      ideal,
      quente,
      fria,
      max,
      diasUnicosIdeal: diasUnicosIdeal || ideal,
    };
  }, [medicoes]);

  const openPdfSelector = () => {
    setPdfSelectedLeiras(leirasNoGrafico);
    setPdfModalOpen(true);
  };

  const confirmPdfExport = () => {
    setPdfModalOpen(false);
    const param = pdfSelectedLeiras.join(',');
    nav(`/orcamentos/${o.id}/relatorio?tab=monitoramento&leiras=${param}`);
  };

  // Geometria SVG do Gráfico Interativo
  const svgW = 860;
  const svgH = 310;
  const padL = 52;
  const padR = 135; // espaço à direita para rótulos diretos das zonas térmicas (Tufte)
  const padT = 22;
  const padB = 38;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const maxTempY = 80;

  const xForIdx = (idx: number) => {
    if (chartSeriesByDate.length <= 1) return padL + plotW / 2;
    return padL + (idx / (chartSeriesByDate.length - 1)) * plotW;
  };
  const yForTemp = (t: number) => {
    const clamped = Math.max(0, Math.min(maxTempY, t));
    return padT + plotH - (clamped / maxTempY) * plotH;
  };

  const y65 = yForTemp(65);
  const y45 = yForTemp(45);

  return (
    <div className="space-y-6">
      {/* TOP BAR (Fiel ao R3e do Base44) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav(`/orcamentos/${o.id}/editar`)}
            className="rounded-xl p-2 transition hover:bg-black/5 dark:hover:bg-white/5"
            title="Voltar para o Orçamento"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Thermometer className="h-5 w-5 text-emerald-600" />
              Monitoramento de Leira
            </h1>
            <p className="text-xs text-slate-500">
              #{o.numero} · {o.clienteNome}
              {o.propriedade ? ` · ${o.propriedade}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => nav(`/orcamentos/${o.id}/relatorio?tab=montagem`)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <Ruler className="h-3.5 w-3.5" /> Montagem da Leira
          </button>
          <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Upload className="h-3.5 w-3.5 text-emerald-600" /> Importar CSV
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleImportCsv}
            />
          </label>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => nav(`/orcamentos/${o.id}/relatorio?tab=geral`)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <Layers className="h-3.5 w-3.5" /> Relatório Geral
          </button>
          <button
            type="button"
            onClick={openPdfSelector}
            className="btn-primary flex h-9 items-center gap-1.5 px-3.5 text-xs font-semibold"
          >
            <FileDown className="h-3.5 w-3.5" /> Baixar PDF
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* BARRA DE RESUMO DO PÁTIO (Fiel ao R3e do Base44) */}
      <div className="card grid grid-cols-2 gap-4 p-4 sm:grid-cols-4 text-xs">
        <div>
          <span className="text-slate-400">Propriedade</span>
          <div className="mt-0.5 font-bold text-sm">{o.propriedade || '—'}</div>
        </div>
        <div>
          <span className="text-slate-400">Leiras em acompanhamento</span>
          <div className="mt-0.5 font-bold text-sm">
            {leirasNoGrafico.length || Math.ceil(o.nrLeiras || 1)} leiras
          </div>
        </div>
        <div>
          <span className="text-slate-400">Ciclo estimado</span>
          <div className="mt-0.5 font-bold text-sm">
            {o.cicloDias > 0 ? `~${Math.round(o.cicloDias)} dias` : '—'}
          </div>
        </div>
        <div>
          <span className="text-slate-400">Faixa Termofílica Alvo</span>
          <div className="mt-0.5 font-bold text-sm text-emerald-600">
            45 °C a 65 °C (Ativa)
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. O GRÁFICO INTERATIVO DE EVOLUÇÃO DAS LEIRAS (N3e + Storytelling Data)  */}
      {/* ========================================================================= */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-600" />
              <h2 className="text-base font-bold">
                {headline || 'Evolução da Temperatura por Leira'}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Faixa verde = compostagem ativa (45 a 65°C). Pontos vermelhos passaram do limite (&gt;65°C); amarelos estão abaixo (&lt;45°C).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHideZeroLeiras(!hideZeroLeiras)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                hideZeroLeiras
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              {hideZeroLeiras ? 'Mostrando apenas leiras > 0°C' : 'Ocultar leiras em 0°C'}
            </button>
          </div>
        </div>

        {/* Pílulas de Filtro de Leira (Idênticas ao N3e do Base44) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedLeiraFilter('todas')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedLeiraFilter === 'todas'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Todas ({leirasNoGrafico.length})
          </button>
          {leirasNoGrafico.map((numLeira, idx) => {
            const color = BASE44_LEIRA_COLORS[idx % BASE44_LEIRA_COLORS.length];
            const isSelected = selectedLeiraFilter === String(numLeira);
            return (
              <button
                key={numLeira}
                type="button"
                onClick={() =>
                  setSelectedLeiraFilter(isSelected ? 'todas' : String(numLeira))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-transparent shadow-sm dark:bg-white dark:text-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                Leira {numLeira}
              </button>
            );
          })}
        </div>

        {/* Área do Gráfico SVG de Alta Precisão */}
        {chartSeriesByDate.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-slate-400 border border-dashed rounded-xl">
            Registre a primeira medição abaixo para ver o gráfico de evolução térmica
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full min-w-[640px] select-none"
                onMouseLeave={() => setHoveredDateIdx(null)}
              >
                {/* Zonas Térmicas Agronômicas */}
                {/* Acima de 65°C: Zona de Superaquecimento */}
                <rect
                  x={padL}
                  y={padT}
                  width={plotW}
                  height={y65 - padT}
                  fill="#ef4444"
                  fillOpacity="0.04"
                />
                {/* 45°C a 65°C: Faixa Termofílica Ideal */}
                <rect
                  x={padL}
                  y={y65}
                  width={plotW}
                  height={y45 - y65}
                  fill="#10b981"
                  fillOpacity="0.13"
                />
                <line
                  x1={padL}
                  x2={padL + plotW}
                  y1={y65}
                  y2={y65}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
                <line
                  x1={padL}
                  x2={padL + plotW}
                  y1={y45}
                  y2={y45}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                  strokeOpacity="0.8"
                />

                {/* Rótulos diretos à direita (Tufte Direct Zone Labeling) */}
                <text
                  x={padL + plotW + 8}
                  y={y65 - 6}
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#dc2626"
                >
                  &gt; 65°C Superaquecimento
                </text>
                <text
                  x={padL + plotW + 8}
                  y={(y65 + y45) / 2 + 3}
                  fontSize="10"
                  fontWeight="700"
                  fill="#059669"
                >
                  45–65°C Faixa Ideal
                </text>
                <text
                  x={padL + plotW + 8}
                  y={y45 + 14}
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#d97706"
                >
                  &lt; 45°C Mesófila / Fria
                </text>

                {/* Grade Horizontal (Eixo Y: 0°C a 80°C) */}
                {[0, 20, 40, 45, 60, 65, 80].map((tempVal) => {
                  const y = yForTemp(tempVal);
                  const isBoundary = tempVal === 45 || tempVal === 65;
                  return (
                    <g key={tempVal}>
                      {!isBoundary && (
                        <line
                          x1={padL}
                          x2={padL + plotW}
                          y1={y}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                        />
                      )}
                      <text
                        x={padL - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fontSize={isBoundary ? '10' : '10.5'}
                        fontWeight={isBoundary ? '700' : '500'}
                        fill={
                          tempVal === 65
                            ? '#dc2626'
                            : tempVal === 45
                            ? '#059669'
                            : '#64748b'
                        }
                      >
                        {tempVal}°C
                      </text>
                    </g>
                  );
                })}

                {/* Eixo X: Datas */}
                {chartSeriesByDate.map((dItem, idx) => {
                  const x = xForIdx(idx);
                  return (
                    <g key={dItem.dataIso}>
                      <line
                        x1={x}
                        x2={x}
                        y1={padT}
                        y2={padT + plotH}
                        stroke={hoveredDateIdx === idx ? '#94a3b8' : '#f1f5f9'}
                        strokeDasharray={hoveredDateIdx === idx ? '2 2' : undefined}
                        strokeWidth={hoveredDateIdx === idx ? '1.5' : '1'}
                      />
                      <text
                        x={x}
                        y={padT + plotH + 22}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={hoveredDateIdx === idx ? '700' : '500'}
                        fill="#475569"
                      >
                        {dItem.label}
                      </text>
                    </g>
                  );
                })}

                {/* Quando apenas 1 leira está selecionada, mostra a faixa sombreada Mín-Máx entre Ponto 1, 2 e 3 */}
                {leirasVisiveis.length === 1 &&
                  (() => {
                    const ln = leirasVisiveis[0];
                    const color = getLeiraColor(ln, leirasNoGrafico);
                    const pts = chartSeriesByDate
                      .map((dItem, idx) => {
                        const rec = dItem.valuesByLeira[ln];
                        if (!rec) return null;
                        const minP = Math.min(rec.p1, rec.p2, rec.p3);
                        const maxP = Math.max(rec.p1, rec.p2, rec.p3);
                        return { x: xForIdx(idx), yMin: yForTemp(minP), yMax: yForTemp(maxP) };
                      })
                      .filter(Boolean) as { x: number; yMin: number; yMax: number }[];
                    if (pts.length < 2) return null;
                    const polyPoints = [
                      ...pts.map((p) => `${p.x},${p.yMax}`),
                      ...pts
                        .slice()
                        .reverse()
                        .map((p) => `${p.x},${p.yMin}`),
                    ].join(' ');
                    return (
                      <polygon
                        points={polyPoints}
                        fill={color}
                        fillOpacity="0.12"
                      />
                    );
                  })()}

                {/* Curvas e Pontos de cada Leira Visível */}
                {leirasVisiveis.map((numLeira) => {
                  const color = getLeiraColor(numLeira, leirasNoGrafico);
                  const pts = chartSeriesByDate
                    .map((dItem, idx) => {
                      const rec = dItem.valuesByLeira[numLeira];
                      if (!rec) return null;
                      return {
                        idx,
                        x: xForIdx(idx),
                        y: yForTemp(rec.media),
                        media: rec.media,
                        p1: rec.p1,
                        p2: rec.p2,
                        p3: rec.p3,
                      };
                    })
                    .filter(Boolean) as {
                    idx: number;
                    x: number;
                    y: number;
                    media: number;
                    p1: number;
                    p2: number;
                    p3: number;
                  }[];

                  if (pts.length === 0) return null;

                  const pathD = pts
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                    .join(' ');

                  const lastPt = pts[pts.length - 1];

                  return (
                    <g key={numLeira}>
                      {pts.length > 1 && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke={color}
                          strokeWidth={leirasVisiveis.length === 1 ? '3.2' : '2.4'}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                      {pts.map((p) => {
                        const isOver65 = p.media > 65;
                        const isUnder45 = p.media < 45;
                        return (
                          <g key={`${numLeira}-${p.idx}`}>
                            {isOver65 ? (
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="5.5"
                                fill="#ffffff"
                                stroke="#dc2626"
                                strokeWidth="2.5"
                              />
                            ) : isUnder45 ? (
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="#ffffff"
                                stroke="#f59e0b"
                                strokeWidth="2.2"
                              />
                            ) : (
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="4.5"
                                fill={color}
                                stroke="#ffffff"
                                strokeWidth="1.5"
                              />
                            )}
                            {/* Rótulo direto do valor quando filtrada 1 leira ou no último ponto */}
                            {(leirasVisiveis.length === 1 ||
                              (p.idx === lastPt.idx && p.media > 0)) && (
                              <text
                                x={p.x + 7}
                                y={p.y - 6}
                                fontSize="9.5"
                                fontWeight="700"
                                fill={color}
                              >
                                L{numLeira}: {num(p.media, 1)}°
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* Colunas invisíveis para Hover / Tooltip interativo */}
                {chartSeriesByDate.map((dItem, idx) => {
                  const x = xForIdx(idx);
                  const colW =
                    chartSeriesByDate.length > 1
                      ? plotW / chartSeriesByDate.length
                      : plotW;
                  return (
                    <rect
                      key={`hover-${dItem.dataIso}`}
                      x={x - colW / 2}
                      y={padT}
                      width={colW}
                      height={plotH}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredDateIdx(idx)}
                      onClick={() => setSelectedDate(dItem.dataIso)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Card Flutuante de Detalhes do Dia (Hover Tooltip) */}
            {hoveredDateIdx !== null && chartSeriesByDate[hoveredDateIdx] && (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/95 p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
                <div className="mb-2 flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>
                    Leituras do dia {chartSeriesByDate[hoveredDateIdx].fullDate} (clique no gráfico para carregar este dia na planilha abaixo)
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Faixa Ideal: 45–65°C
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {leirasVisiveis.map((ln) => {
                    const rec = chartSeriesByDate[hoveredDateIdx].valuesByLeira[ln];
                    const color = getLeiraColor(ln, leirasNoGrafico);
                    if (!rec) return null;
                    const ideal = rec.media >= 45 && rec.media <= 65;
                    const hot = rec.media > 65;
                    return (
                      <div
                        key={ln}
                        className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 font-bold">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: color }}
                            />
                            Leira {ln}
                          </span>
                          <span
                            className={`font-extrabold ${
                              ideal
                                ? 'text-emerald-600'
                                : hot
                                ? 'text-red-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {num(rec.media, 1)}°C
                          </span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          P1:{num(rec.p1, 0)}° · P2:{num(rec.p2, 0)}° · P3:{num(rec.p3, 0)}°
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MEDIR A TEMPERATURA DE HOJE (Planilha Diária Multi-Leira S3e Base44)   */}
      {/* ========================================================================= */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-emerald-600" />
            <div>
              <h2 className="text-sm font-bold">Medir a temperatura de hoje</h2>
              <p className="text-xs text-slate-500">
                Preencha os 3 pontos de leitura com termômetro haste (topo, centro e base da leira). A média é calculada na hora.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Atalhos rápidos de datas já registradas */}
            <div className="flex items-center gap-1">
              {datasDisponiveis.map((dt) => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => setSelectedDate(dt)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedDate === dt
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {dt.slice(5).split('-').reverse().join('/')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Dia:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500">
                  Leira
                </th>
                <th className="text-center px-2 py-2.5 font-semibold text-slate-500">
                  Ponto 1 (°C)
                </th>
                <th className="text-center px-2 py-2.5 font-semibold text-slate-500">
                  Ponto 2 (°C)
                </th>
                <th className="text-center px-2 py-2.5 font-semibold text-slate-500">
                  Ponto 3 (°C)
                </th>
                <th className="text-center px-3 py-2.5 font-semibold text-slate-500">
                  Média (°C)
                </th>
                <th className="text-center px-2 py-2.5 font-semibold text-slate-500">
                  Umidade (%)
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500">
                  Água / Revolvimento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
              {rows.map((r, idx) => {
                const media = calcRowMedia(r);
                const isIdeal = media >= 45 && media <= 65;
                const isHot = media > 65;
                const isLow = media > 0 && media < 45;
                const badgeClass = isIdeal
                  ? 'text-emerald-700 bg-emerald-500/15 border-emerald-500/40 dark:text-emerald-300'
                  : isHot
                  ? 'text-red-700 bg-red-500/15 border-red-500/40 dark:text-red-300'
                  : isLow
                  ? 'text-amber-700 bg-amber-500/15 border-amber-500/40 dark:text-amber-300'
                  : 'text-slate-400 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700';

                return (
                  <tr
                    key={r.leira}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-3 py-2 font-bold whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background: getLeiraColor(r.leira, leirasNoGrafico),
                          }}
                        />
                        Leira {r.leira}
                      </span>
                    </td>
                    {(['ponto1', 'ponto2', 'ponto3'] as const).map((field) => (
                      <td key={field} className="px-2 py-1.5 text-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="—"
                          value={r[field]}
                          onChange={(e) => updateRow(idx, field, e.target.value)}
                          className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-xs font-medium focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-1.5 text-center">
                      <span
                        className={`inline-block min-w-[64px] rounded-lg border px-2.5 py-1 font-bold ${badgeClass}`}
                      >
                        {media > 0 ? `${num(media, 1)}°` : '—'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="—"
                        value={r.umidade}
                        onChange={(e) => updateRow(idx, 'umidade', e.target.value)}
                        className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-xs font-medium focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Ex: Revolvida, molhou"
                          value={r.agua_revolvimento}
                          onChange={(e) =>
                            updateRow(idx, 'agua_revolvimento', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          title="Marcar Revolvida"
                          onClick={() =>
                            updateRow(
                              idx,
                              'agua_revolvimento',
                              r.agua_revolvimento === 'Revolvida'
                                ? 'Revolvida + Água'
                                : 'Revolvida'
                            )
                          }
                          className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Marcar Irrigação / Molhou"
                          onClick={() =>
                            updateRow(
                              idx,
                              'agua_revolvimento',
                              r.agua_revolvimento === 'Molhou'
                                ? 'Revolvida + Água'
                                : 'Molhou'
                            )
                          }
                          className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 dark:border-slate-700"
                        >
                          <Droplets className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleAddLeiraRow}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar Leira
          </button>

          <button
            type="button"
            onClick={handleSaveDay}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-sm"
          >
            <Save className="h-4 w-4" /> Salvar medições do dia
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. GUIA AGRONÔMICO DE MANEJO PARA O AGRICULTOR (Embrapa / Kiehl)          */}
      {/* ========================================================================= */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card border-l-4 border-l-emerald-600 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> 45°C a 65°C · Faixa Ideal
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Atividade microbiológica termofílica máxima. Elimina sementes de ervas daninhas e patógenos. Mantenha a umidade entre <b>50% e 60%</b>.
          </p>
        </div>
        <div className="card border-l-4 border-l-red-600 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            <Flame className="h-4 w-4" /> Acima de 65°C · Superaquecimento
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Risco de perda de Nitrogênio por volatilização (cheiro de amônia) e queima da matéria orgânica. <b>Revolva a leira imediatamente</b> e irrigue se estiver seca.
          </p>
        </div>
        <div className="card border-l-4 border-l-amber-500 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" /> Abaixo de 45°C · Baixa Atividade
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            No início do ciclo indica falta de água (&lt;40%) ou excesso de água sem oxigênio. Faça o <b>Teste da Mão</b>: aperte o composto; deve umedecer a palma sem pingar.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONCLUSÃO DO CICLO (Fiel ao O3e do Base44)                             */}
      {/* ========================================================================= */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-4 rounded-full bg-emerald-600" />
          <h2 className="text-sm font-bold">Conclusão do Ciclo</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-2xl font-extrabold text-emerald-600">
              {stats.diasUnicosIdeal}
            </div>
            <div className="text-[11px] text-slate-500">dias na faixa ideal</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-2xl font-extrabold">{num(stats.max, 0)}°C</div>
            <div className="text-[11px] text-slate-500">máxima atingida</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-2xl font-extrabold">{stats.total}</div>
            <div className="text-[11px] text-slate-500">medições ativas no total</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          O ciclo teve {stats.total} medições com leitura térmica: {stats.ideal} na faixa ideal,{' '}
          {stats.quente} acima do limite e {stats.fria} abaixo.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 5. HISTÓRICO COMPLETO DE MEDIÇÕES                                         */}
      {/* ========================================================================= */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-emerald-600" />
            <h3 className="text-sm font-bold">
              Histórico Completo de Medições ({medicoes.length} registros)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Clique na data para editar na grade acima
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Leira</th>
                <th className="text-right">Ponto 1 (°C)</th>
                <th className="text-right">Ponto 2 (°C)</th>
                <th className="text-right">Ponto 3 (°C)</th>
                <th className="text-right">Média (°C)</th>
                <th className="text-right">Umidade (%)</th>
                <th>Água e Revolvimento</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {medicoes.map((m) => {
                const isIdeal = m.media >= 45 && m.media <= 65;
                const isHot = m.media > 65;
                const isLow = m.media > 0 && m.media < 45;
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedDate(m.data)}
                    className="cursor-pointer"
                  >
                    <td>{m.data.split('-').reverse().join('/')}</td>
                    <td className="font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            background: getLeiraColor(m.leiraNumero, leirasNoGrafico),
                          }}
                        />
                        Leira {m.leiraNumero}
                      </span>
                    </td>
                    <td className="text-right">{num(m.ponto1, 1)}</td>
                    <td className="text-right">{num(m.ponto2, 1)}</td>
                    <td className="text-right">{num(m.ponto3, 1)}</td>
                    <td
                      className={`text-right font-bold ${
                        isIdeal
                          ? 'text-emerald-600'
                          : isHot
                          ? 'text-red-600'
                          : isLow
                          ? 'text-amber-600'
                          : ''
                      }`}
                    >
                      {num(m.media, 1)}
                    </td>
                    <td className="text-right">{m.umidadePct}%</td>
                    <td>{m.aguaRevolvimento === 'Nenhum' ? '—' : m.aguaRevolvimento}</td>
                    <td
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => removeMedicao(m.id)}
                        className="text-slate-400 hover:text-red-500"
                        title="Excluir medição"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {medicoes.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-slate-400">
                    Nenhuma medição registrada para este orçamento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ESCOLHER LEIRAS PARA O PDF                                         */}
      {/* ========================================================================= */}
      {pdfModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setPdfModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md my-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-base font-bold">Escolher leiras para o PDF</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Marque apenas as leiras que você quer mostrar no relatório impresso.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPdfModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="my-3 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setPdfSelectedLeiras(leirasNoGrafico)}
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  Selecionar todas
                </button>
                <button
                  type="button"
                  onClick={() => setPdfSelectedLeiras([])}
                  className="text-slate-500 hover:underline"
                >
                  Limpar seleção
                </button>
              </div>

              <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto py-1">
                {leirasNoGrafico.map((numLeira) => {
                  const checked = pdfSelectedLeiras.includes(numLeira);
                  return (
                    <button
                      key={numLeira}
                      type="button"
                      onClick={() =>
                        setPdfSelectedLeiras((prev) =>
                          checked
                            ? prev.filter((x) => x !== numLeira)
                            : [...prev, numLeira].sort((a, b) => a - b)
                        )
                      }
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        checked
                          ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 text-slate-500 hover:text-slate-900 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          checked
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      Leira {numLeira}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPdfModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={pdfSelectedLeiras.length === 0}
                  onClick={confirmPdfExport}
                  className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                >
                  PDF Monitoramento ({pdfSelectedLeiras.length})
                </button>
                <button
                  type="button"
                  disabled={pdfSelectedLeiras.length === 0}
                  onClick={() => {
                    setPdfModalOpen(false);
                    const param = pdfSelectedLeiras.join(',');
                    nav(`/orcamentos/${o.id}/relatorio?tab=geral&leiras=${param}`);
                  }}
                  className="btn-primary px-4 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  Relatório Geral ({pdfSelectedLeiras.length})
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
