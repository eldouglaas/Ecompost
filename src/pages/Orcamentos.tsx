import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Pencil,
  Plus,
  Printer,
  Ruler,
  Search,
  Thermometer,
  Trash2,
} from 'lucide-react';
import { PageHeader, Pill } from '../components/ui';
import { brl, num, useStore } from '../store/store';

const badge = {
  Aberto: 'badge-open',
  Aprovado: 'badge-active',
  Cancelado: 'badge-canceled',
} as const;

export default function Orcamentos() {
  const {
    orcamentos,
    clientes,
    deleteOrcamento,
    saveOrcamento,
  } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [sit, setSit] = useState('');
  const [cli, setCli] = useState('');
  const sel = {
    background: 'var(--bg-card)',
    borderColor: 'var(--border-card)',
  };

  const list = [...orcamentos]
    .sort((a, b) => (b.numero || 0) - (a.numero || 0))
    .filter(
      (o) =>
        (!sit || o.situacao === sit) &&
        (!cli || o.clienteId === cli) &&
        `${o.numero} ${o.clienteNome} ${o.descricao} ${o.consultor}`
          .toLowerCase()
          .includes(q.toLowerCase())
    );
  const c = (s: string) => orcamentos.filter((o) => o.situacao === s).length;

  return (
    <div>
      <PageHeader
        icon={<FileText />}
        title="Orçamentos"
        subtitle="Projetos de compostagem"
        action={
          <button
            className="btn-primary"
            onClick={() => nav('/orcamentos/novo')}
          >
            <Plus className="h-4 w-4" /> Novo Orçamento
          </button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Pill label="Total" value={orcamentos.length} color="#94a3b8" />
        <Pill label="Abertos" value={c('Aberto')} color="#3b82f6" />
        <Pill label="Aprovados" value={c('Aprovado')} color="#10b981" />
        <Pill label="Cancelados" value={c('Cancelado')} color="#ef4444" />
        <Pill
          label="Valor total"
          value={brl(orcamentos.reduce((s, o) => s + o.custoTotal, 0))}
          color="#f59e0b"
        />
        <div className="ml-auto flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar cliente, descrição, consultor.."
              className="rounded-lg border py-2 pl-9 pr-3 text-sm"
              style={sel}
            />
          </div>
          <select
            value={sit}
            onChange={(e) => setSit(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={sel}
          >
            <option value="">Todas situações</option>
            <option>Aberto</option>
            <option>Aprovado</option>
            <option>Cancelado</option>
          </select>
          <select
            value={cli}
            onChange={(e) => setCli(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={sel}
          >
            <option value="">Todos clientes</option>
            {clientes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Descrição</th>
              <th className="text-right">Área</th>
              <th className="text-right">Dose</th>
              <th className="text-right">Total</th>
              <th>Sit.</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr
                key={o.id}
                onClick={() => nav(`/orcamentos/${o.id}/editar`)}
                className="cursor-pointer"
              >
                <td className="text-slate-500">{o.numero}</td>
                <td>{o.data.split('-').reverse().join('/')}</td>
                <td className="font-semibold">{o.clienteNome}</td>
                <td>{o.descricao}</td>
                <td className="text-right">{num(o.areaHa)}</td>
                <td className="text-right">{num(o.doseCompostoTnHa, 3)}</td>
                <td className="text-right font-bold">{brl(o.custoTotal)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    value={o.situacao}
                    onChange={(e) =>
                      saveOrcamento({
                        ...o,
                        situacao: e.target.value as typeof o.situacao,
                      })
                    }
                    className={`${badge[o.situacao]} cursor-pointer border-0`}
                  >
                    <option>Aberto</option>
                    <option>Aprovado</option>
                    <option>Cancelado</option>
                  </select>
                </td>
                <td
                  className="whitespace-nowrap text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    title="Editar Orçamento"
                    to={`/orcamentos/${o.id}/editar`}
                    className="mr-3 inline-block hover:text-emerald-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Link
                    title="Relatórios e PDFs"
                    to={`/orcamentos/${o.id}/relatorio?tab=resumido`}
                    className="mr-3 inline-block hover:text-emerald-600"
                  >
                    <Printer className="h-4 w-4" />
                  </Link>
                  <Link
                    title="Montagem de Leira (Kg/m)"
                    to={`/orcamentos/${o.id}/relatorio?tab=montagem`}
                    className="mr-3 inline-block hover:text-blue-600"
                  >
                    <Ruler className="h-4 w-4" />
                  </Link>
                  <Link
                    title="Monitoramento de Leira e Gráfico Térmico"
                    to={`/orcamentos/${o.id}/monitoramento`}
                    className="mr-3 inline-block hover:text-amber-500"
                  >
                    <Thermometer className="h-4 w-4" />
                  </Link>
                  <button
                    title="Excluir"
                    className="hover:text-red-600"
                    onClick={() =>
                      confirm('Excluir orçamento?') && deleteOrcamento(o.id)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Nenhum orçamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-bold">
              <td colSpan={6} className="uppercase text-xs text-slate-500">
                Total ({list.length} de {orcamentos.length} orçamentos)
              </td>
              <td className="text-right">
                {brl(list.reduce((s, o) => s + (o.custoTotal || 0), 0))}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
