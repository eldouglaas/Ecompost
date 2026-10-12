import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, RotateCw, Thermometer, Trash2 } from 'lucide-react';
import { Field, Input } from '../components/ui';
import { num, uid, useStore } from '../store/store';
import { LeituraMonitoramento } from '../types';

const fase = (dia: number) => (dia <= 4 ? 'Mesófilo' : dia <= 25 ? 'Termófilo' : 'Maturação');
const tempColor = (t: number) => (t > 65 ? '#dc2626' : t >= 45 ? '#e7a13a' : '#4f7be8');

export default function Monitoramento() {
  const { id } = useParams();
  const nav = useNavigate();
  const { orcamentos, saveOrcamento } = useStore();
  const o = orcamentos.find((x) => x.id === id);
  const [f, setF] = useState({ dia: 1, temp: 30, umid: 55, rev: false, obs: '' });
  if (!o) return <div>Orçamento não encontrado. <Link to="/orcamentos" className="text-emerald-600">Voltar</Link></div>;

  const leituras = [...(o.leiras?.[0]?.leituras ?? [])].sort((a, b) => a.diaCiclo - b.diaCiclo);
  const persist = (ls: LeituraMonitoramento[]) => {
    const base = o.leiras?.[0] ?? {
      numero: 1, comprimentoM: o.leiraExtensaoM, alturaM: o.leiraAlturaM, baseMaiorM: o.leiraBaseMaiorM,
      baseMenorM: o.leiraBaseMenorM, volumeM3: o.secaoM2 * o.leiraExtensaoM,
      massaEstimadaTn: o.pesoFinalTn / Math.max(1, Math.ceil(o.nrLeiras)),
      dataInicio: o.data, fase: 'Mesófilo' as const, leituras: [],
    };
    saveOrcamento({ ...o, leiras: [{ ...base, leituras: ls }] });
  };
  const add = () =>
    persist([...leituras, { id: uid(), data: new Date().toISOString().slice(0, 10), diaCiclo: f.dia, temperaturaC: f.temp, umidadePct: f.umid, reviramento: f.rev, observacao: f.obs }]);

  const last = leituras[leituras.length - 1];
  const W = 640, H = 220, maxD = Math.max(56, ...leituras.map((l) => l.diaCiclo));
  const x = (d: number) => 40 + (d / maxD) * (W - 60);
  const y = (t: number) => H - 30 - (t / 80) * (H - 50);
  const alerta = last && last.temperaturaC > 65 ? 'Temperatura acima de 65 °C — revolver a leira para resfriar.' : last && last.diaCiclo > 4 && last.temperaturaC < 45 ? 'Temperatura abaixo de 45 °C na fase termófila — verificar umidade, aeração e C:N.' : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => nav('/orcamentos')}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Thermometer className="text-emerald-600" /> Monitoramento de Leira <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>· #{o.numero} {o.clienteNome}</span></h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[['Leira', `${num(o.leiraExtensaoM, 0)} m × ${num(o.secaoM2)} m²`], ['Volume', `${num(o.secaoM2 * o.leiraExtensaoM, 0)} m³`], ['Fase atual', last ? fase(last.diaCiclo) : 'Mesófilo'], ['Última temp.', last ? `${last.temperaturaC} °C` : '—']].map(([l, v]) => (
          <div key={l} className="card p-4"><div className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{l}</div><div className="text-xl font-bold">{v}</div></div>
        ))}
      </div>
      {alerta && <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-800">⚠ {alerta}</div>}

      <div className="card p-4">
        <div className="mb-2 font-semibold">Curva de temperatura (°C) × dia do ciclo</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <rect x={x(0)} y={y(45)} width={x(4) - x(0)} height={y(20) - y(45)} fill="#6b9bf033" />
          <rect x={x(4)} y={y(70)} width={x(25) - x(4)} height={y(45) - y(70)} fill="#e7a13a33" />
          {[0, 20, 40, 60, 80].map((t) => (<g key={t}><line x1={40} x2={W - 20} y1={y(t)} y2={y(t)} stroke="#cbd5e1" strokeDasharray="3" /><text x={8} y={y(t) + 4} fontSize="10" fill="#64748b">{t}</text></g>))}
          <line x1={40} x2={W - 20} y1={y(65)} y2={y(65)} stroke="#dc2626" strokeDasharray="4" />
          {leituras.length > 1 && <polyline fill="none" stroke="#10b981" strokeWidth="2" points={leituras.map((l) => `${x(l.diaCiclo)},${y(l.temperaturaC)}`).join(' ')} />}
          {leituras.map((l) => <circle key={l.id} cx={x(l.diaCiclo)} cy={y(l.temperaturaC)} r="4" fill={tempColor(l.temperaturaC)} />)}
          {[0, 14, 28, 42, 56].map((d) => <text key={d} x={x(d)} y={H - 10} fontSize="10" fill="#64748b">d{d}</text>)}
        </svg>
      </div>

      <div className="card p-4">
        <div className="mb-3 font-semibold">Nova medição</div>
        <div className="grid items-end gap-3 md:grid-cols-6">
          <Field label="Dia do ciclo"><Input type="number" min={0} value={f.dia} onChange={(e) => setF({ ...f, dia: +e.target.value })} /></Field>
          <Field label="Temperatura (°C)"><Input type="number" value={f.temp} onChange={(e) => setF({ ...f, temp: +e.target.value })} /></Field>
          <Field label="Umidade (%)"><Input type="number" value={f.umid} onChange={(e) => setF({ ...f, umid: +e.target.value })} /></Field>
          <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={f.rev} onChange={(e) => setF({ ...f, rev: e.target.checked })} /> Reviramento</label>
          <Field label="Observação"><Input value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} /></Field>
          <button className="btn-primary" onClick={add}><Plus className="h-4 w-4" /> Registrar</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Dia</th><th>Data</th><th>Fase</th><th>Temp.</th><th>Umid.</th><th>Reviramento</th><th>Obs.</th><th /></tr></thead>
          <tbody>
            {leituras.map((l) => (
              <tr key={l.id}>
                <td>{l.diaCiclo}</td><td>{new Date(l.data).toLocaleDateString('pt-BR')}</td><td>{fase(l.diaCiclo)}</td>
                <td className="font-bold" style={{ color: tempColor(l.temperaturaC) }}>{l.temperaturaC} °C</td><td>{l.umidadePct}%</td>
                <td>{l.reviramento && <RotateCw className="h-4 w-4 text-emerald-600" />}</td><td>{l.observacao}</td>
                <td><button onClick={() => persist(leituras.filter((x) => x.id !== l.id))}><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
            {leituras.length === 0 && <tr><td colSpan={8} className="text-center" style={{ color: 'var(--text-muted)' }}>Nenhuma medição registrada.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
