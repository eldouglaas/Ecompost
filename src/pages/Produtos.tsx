import { useState } from 'react';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Field, Input, Modal, PageHeader, Pill, Select } from '../components/ui';
import { brl, uid, useStore } from '../store/store';
import { ComposicaoNutricional, Produto } from '../types';

const empty = (): Produto => ({ id: uid(), nome: '', tipo: 'Orgânico', unidade: 'TN', valorUnitario: 0, umidadePct: 0, densidadeTnM3: 0.72, nutrientes: {} });
const badge = { Orgânico: 'badge-organico', Mineral: 'badge-mineral', Biológico: 'badge-biologico' } as const;

const nutFields: [keyof ComposicaoNutricional, string][] = [
  ['c_pct', 'C (%)'], ['n_pct', 'N (%)'], ['p2o5_pct', 'P2O5 (%)'], ['k2o_pct', 'K2O (%)'],
  ['ca_pct', 'Ca (%)'], ['mg_pct', 'Mg (%)'], ['s_pct', 'S (%)'], ['si_pct', 'Si (%)'],
  ['mn_ppm', 'Mn (ppm)'], ['zn_ppm', 'Zn (ppm)'], ['co_ppm', 'Co (ppm)'], ['cu_ppm', 'Cu (ppm)'],
  ['mo_ppm', 'Mo (ppm)'], ['b_ppm', 'B (ppm)'],
];

export default function Produtos() {
  const { produtos, clientes, saveProduto, deleteProduto } = useStore();
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('');
  const [cli, setCli] = useState('');
  const [edit, setEdit] = useState<Produto | null>(null);

  const list = produtos.filter(
    (p) => (!tipo || p.tipo === tipo) && (!cli || p.clienteId === cli) && `${p.nome} ${p.tipo}`.toLowerCase().includes(q.toLowerCase())
  );
  const cname = (id?: string) => clientes.find((c) => c.id === id)?.nome || '—';
  const count = (t: string) => produtos.filter((p) => p.tipo === t).length;
  const sel = { background: 'var(--bg-card)', borderColor: 'var(--border-card)' };

  return (
    <div>
      <PageHeader icon={<Package />} title="Produtos / Insumos" subtitle="Catálogo de insumos e composição nutricional"
        action={<button className="btn-primary" onClick={() => setEdit(empty())}><Plus className="h-4 w-4" /> Novo Produto</button>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Pill label="Total" value={produtos.length} color="#94a3b8" />
        <Pill label="Orgânicos" value={count('Orgânico')} color="#10b981" />
        <Pill label="Minerais" value={count('Mineral')} color="#f59e0b" />
        <Pill label="Biológicos" value={count('Biológico')} color="#3b82f6" />
        <div className="ml-auto flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto, tipo..." className="rounded-lg border py-2 pl-9 pr-3 text-sm" style={sel} />
          </div>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="rounded-lg border px-3 text-sm" style={sel}>
            <option value="">Todos tipos</option><option>Orgânico</option><option>Mineral</option><option>Biológico</option>
          </select>
          <select value={cli} onChange={(e) => setCli(e.target.value)} className="rounded-lg border px-3 text-sm" style={sel}>
            <option value="">Todos clientes</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Nome</th><th>Cliente</th><th>Tipo</th><th>Un.</th><th className="text-right">Valor</th><th className="text-right">Umid.%</th><th /></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold">{p.nome}</td>
                <td>{cname(p.clienteId)}</td>
                <td><span className={badge[p.tipo]}>{p.tipo}</span></td>
                <td>{p.unidade}</td>
                <td className="text-right font-semibold">{brl(p.valorUnitario)}</td>
                <td className="text-right">{p.umidadePct}%</td>
                <td className="whitespace-nowrap text-right">
                  <button className="mr-3" onClick={() => setEdit(p)}><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm(`Excluir ${p.nome}?`) && deleteProduto(p.id)}><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <Modal title={produtos.some((p) => p.id === edit.id) ? 'Editar Produto' : 'Novo Produto'} onClose={() => setEdit(null)}>
          <form className="grid grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); saveProduto({ ...edit, clienteNome: cname(edit.clienteId) }); setEdit(null); }}>
            <div className="col-span-2"><Field label="Nome *"><Input required value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} /></Field></div>
            <Field label="Cliente">
              <Select value={edit.clienteId || ''} onChange={(e) => setEdit({ ...edit, clienteId: e.target.value || undefined })}>
                <option value="">—</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </Field>
            <Field label="Tipo">
              <Select value={edit.tipo} onChange={(e) => setEdit({ ...edit, tipo: e.target.value as Produto['tipo'] })}>
                <option>Orgânico</option><option>Mineral</option><option>Biológico</option>
              </Select>
            </Field>
            <Field label="Valor (R$/TN)"><Input type="number" step="any" value={edit.valorUnitario} onChange={(e) => setEdit({ ...edit, valorUnitario: +e.target.value })} /></Field>
            <Field label="Umidade (%)"><Input type="number" step="any" value={edit.umidadePct} onChange={(e) => setEdit({ ...edit, umidadePct: +e.target.value })} /></Field>
            <Field label="Densidade (tn/m³)"><Input type="number" step="any" value={edit.densidadeTnM3} onChange={(e) => setEdit({ ...edit, densidadeTnM3: +e.target.value })} /></Field>
            <div className="col-span-2 text-sm font-semibold">Composição nutricional</div>
            <div className="col-span-2 grid grid-cols-4 gap-3">
              {nutFields.map(([k, l]) => (
                <Field key={k} label={l}>
                  <Input type="number" step="any" value={edit.nutrientes[k] ?? ''} onChange={(e) => setEdit({ ...edit, nutrientes: { ...edit.nutrientes, [k]: e.target.value === '' ? undefined : +e.target.value } })} />
                </Field>
              ))}
            </div>
            <div className="col-span-2 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setEdit(null)}>Cancelar</button>
              <button className="btn-primary">Salvar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
