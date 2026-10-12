import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Plus, Printer, RotateCw, Thermometer, Trash2, Upload } from 'lucide-react';
import { Field, Input, Select } from '../components/ui';
import { num, uid, useStore } from '../store/store';
import { MedicaoLeiraPonto } from '../types';

export default function Monitoramento() {
  const { id } = useParams();
  const nav = useNavigate();
  const { orcamentos, saveOrcamento } = useStore();
  const o = orcamentos.find((x) => x.id === id);

  const [form, setForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    leiraNumero: 3,
    ponto1: 45.0,
    ponto2: 50.0,
    ponto3: 52.0,
    umidadePct: 55,
    aguaRevolvimento: 'Nenhum',
  });

  if (!o) {
    return (
      <div className="p-8">
        Orçamento não encontrado. <Link to="/orcamentos" className="text-emerald-600">Voltar</Link>
      </div>
    );
  }

  const medicoes: MedicaoLeiraPonto[] = o.medicoesLeiras || [];

  const addMedicao = () => {
    const media = Number(((form.ponto1 + form.ponto2 + form.ponto3) / 3).toFixed(1));
    const nova: MedicaoLeiraPonto = {
      id: uid(),
      data: form.data,
      leiraNumero: form.leiraNumero,
      ponto1: form.ponto1,
      ponto2: form.ponto2,
      ponto3: form.ponto3,
      media,
      umidadePct: form.umidadePct,
      aguaRevolvimento: form.aguaRevolvimento,
    };
    saveOrcamento({
      ...o,
      medicoesLeiras: [nova, ...medicoes],
    });
  };

  const removeMedicao = (mid: string) => {
    saveOrcamento({
      ...o,
      medicoesLeiras: medicoes.filter((m) => m.id !== mid),
    });
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
        if (parts.length >= 7) {
          const rawData = parts[0]?.trim();
          const dParts = rawData.split('/');
          const isoDate = dParts.length === 3 ? `${dParts[2]}-${dParts[1]}-${dParts[0]}` : rawData;
          const leira = parseInt(parts[1]?.trim() || '0', 10);
          const p1 = parseFloat(parts[2]?.replace(',', '.') || '0');
          const p2 = parseFloat(parts[3]?.replace(',', '.') || '0');
          const p3 = parseFloat(parts[4]?.replace(',', '.') || '0');
          const med = parseFloat(parts[5]?.replace(',', '.') || '0');
          const umid = parseFloat(parts[6]?.replace('%', '').replace(',', '.') || '0');
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
        alert(`${novas.length} medições importadas com sucesso!`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/orcamentos')} className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Thermometer className="text-emerald-600" /> Monitoramento das Leiras
            </h1>
            <p className="text-sm text-slate-500">#{o.numero} · {o.clienteNome}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/orcamentos/${o.id}/relatorio?tab=monitoramento`}
            className="btn-secondary flex items-center gap-1.5 text-xs font-semibold"
          >
            <Printer className="h-4 w-4" /> Relatório Oficial
          </Link>
          <label className="btn-secondary flex cursor-pointer items-center gap-1.5 text-xs font-semibold">
            <Upload className="h-4 w-4 text-emerald-600" /> Importar CSV
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleImportCsv} />
          </label>
        </div>
      </div>

      {/* Formulário de Registro de Nova Medição */}
      <div className="card p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Registrar Medição de Temperatura e Umidade
        </h2>
        <div className="grid gap-3 md:grid-cols-7">
          <Field label="Data">
            <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </Field>
          <Field label="Leira (Nº)">
            <Input type="number" min={1} value={form.leiraNumero} onChange={(e) => setForm({ ...form, leiraNumero: +e.target.value })} />
          </Field>
          <Field label="Ponto 1 (°C)">
            <Input type="number" step="any" value={form.ponto1} onChange={(e) => setForm({ ...form, ponto1: +e.target.value })} />
          </Field>
          <Field label="Ponto 2 (°C)">
            <Input type="number" step="any" value={form.ponto2} onChange={(e) => setForm({ ...form, ponto2: +e.target.value })} />
          </Field>
          <Field label="Ponto 3 (°C)">
            <Input type="number" step="any" value={form.ponto3} onChange={(e) => setForm({ ...form, ponto3: +e.target.value })} />
          </Field>
          <Field label="Umidade (%)">
            <Input type="number" step="any" value={form.umidadePct} onChange={(e) => setForm({ ...form, umidadePct: +e.target.value })} />
          </Field>
          <Field label="Água e Revolvimento">
            <Select value={form.aguaRevolvimento} onChange={(e) => setForm({ ...form, aguaRevolvimento: e.target.value })}>
              <option value="Nenhum">Nenhum</option>
              <option value="Irrigação">Irrigação</option>
              <option value="Revolvimento">Revolvimento</option>
              <option value="Irrigação + Revolvimento">Irrigação + Revolvimento</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary" onClick={addMedicao}>
            <Plus className="h-4 w-4" /> Adicionar Medição
          </button>
        </div>
      </div>

      {/* Histórico das Medições */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <h3 className="font-bold">Histórico das Medições ({medicoes.length})</h3>
        </div>
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
              const isLow = m.media > 0 && m.media < 45;
              return (
                <tr key={m.id}>
                  <td>{m.data.split('-').reverse().join('/')}</td>
                  <td className="font-bold">Leira {m.leiraNumero}</td>
                  <td className="text-right">{num(m.ponto1, 1)}</td>
                  <td className="text-right">{num(m.ponto2, 1)}</td>
                  <td className="text-right">{num(m.ponto3, 1)}</td>
                  <td className={`text-right font-bold ${isIdeal ? 'text-emerald-600' : isLow ? 'text-amber-600' : ''}`}>
                    {num(m.media, 1)}
                  </td>
                  <td className="text-right">{m.umidadePct}%</td>
                  <td>{m.aguaRevolvimento === 'Nenhum' ? '—' : m.aguaRevolvimento}</td>
                  <td className="text-right">
                    <button onClick={() => removeMedicao(m.id)} className="text-slate-400 hover:text-red-500">
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
  );
}
