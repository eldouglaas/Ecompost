import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, FileText, Leaf, Package, TrendingUp, Users } from 'lucide-react';
import { brl, useStore } from '../store/store';

const statusBadge = { Aberto: 'badge-open', Aprovado: 'badge-active', Cancelado: 'badge-canceled' } as const;

export default function Dashboard() {
  const { clientes, produtos, orcamentos } = useStore();
  const total = orcamentos.reduce((s, o) => s + o.custoTotal, 0);
  const counts = { Aberto: 0, Aprovado: 0, Cancelado: 0 };
  orcamentos.forEach((o) => counts[o.situacao]++);
  const sum = Math.max(1, orcamentos.length);
  const colors = { Aberto: '#4f7be8', Aprovado: '#4cb084', Cancelado: '#dc4b4b' };

  let acc = 0;
  const segs = (Object.keys(counts) as (keyof typeof counts)[]).map((k) => {
    const start = acc;
    acc += (counts[k] / sum) * 100;
    return `${colors[k]} ${start}% ${acc}%`;
  });
  const donut = orcamentos.length ? `conic-gradient(${segs.join(',')})` : 'conic-gradient(#cbd5e1 0 100%)';

  const byClient = new Map<string, number>();
  orcamentos.forEach((o) => byClient.set(o.clienteNome, (byClient.get(o.clienteNome) || 0) + o.custoTotal));
  const top = [...byClient.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(1, ...top.map((t) => t[1]));

  const kpis = [
    { icon: Users, v: clientes.length, l: 'Clientes' },
    { icon: Package, v: produtos.length, l: 'Produtos' },
    { icon: FileText, v: orcamentos.length, l: 'Orçamentos' },
    { icon: TrendingUp, v: brl(total), l: 'Valor Total' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 rounded-3xl bg-slate-900 p-10 text-white">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600"><Leaf className="h-10 w-10" /></div>
        <div>
          <h1 className="text-4xl font-bold">Ecompost</h1>
          <p className="font-medium text-emerald-400">Ecologicamente Lucrativo</p>
          <p className="mb-4 text-slate-300">Sistema de gestão e orçamento de compostagem</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/orcamentos/novo" className="btn-primary">Novo Orçamento <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ icon: Icon, v, l }) => (
          <div key={l} className="card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--primary-light)' }}>
              <Icon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{v}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-bold">Orçamentos por Situação</h3>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>Distribuição do pipeline de projetos</p>
          <div className="flex justify-center py-4">
            <div className="relative h-44 w-44 rounded-full" style={{ background: donut }}>
              <div className="absolute inset-7 rounded-full" style={{ background: 'var(--bg-card)' }} />
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
              <span key={k} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: colors[k] }} />{k} ({counts[k]})
              </span>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-bold">Top Clientes por Valor</h3>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>Receita projetada por cliente (R$)</p>
          <div className="space-y-3">
            {top.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sem orçamentos ainda.</p>}
            {top.map(([nome, v]) => (
              <div key={nome}>
                <div className="mb-1 flex justify-between text-xs"><span>{nome}</span><span>{brl(v)}</span></div>
                <div className="h-3 rounded-full" style={{ background: 'var(--bg-card-subtle)' }}>
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${(v / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex justify-between">
            <h3 className="font-bold">Orçamentos Recentes</h3>
            <Link to="/orcamentos" className="flex items-center gap-1 text-sm text-emerald-600">Ver todos <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-3">
            {orcamentos.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum orçamento criado.</p>}
            {[...orcamentos].reverse().slice(0, 5).map((o) => (
              <Link key={o.id} to={`/orcamentos/${o.id}/relatorio`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-black/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--primary-light)' }}>
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{o.clienteNome}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.descricao} · {new Date(o.data).toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{brl(o.custoTotal)}</div>
                  <span className={statusBadge[o.situacao]}>{o.situacao}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-bold">Ações Rápidas</h3>
          {[
            { to: '/clientes', icon: Users, t: 'Cadastrar Cliente', d: 'Adicione novos clientes' },
            { to: '/produtos', icon: Package, t: 'Novo Produto', d: 'Cadastre insumos para compostos' },
            { to: '/orcamentos/novo', icon: FileText, t: 'Novo Orçamento', d: 'Calcule projetos de compostagem' },
          ].map(({ to, icon: Icon, t, d }) => (
            <Link key={t} to={to} className="card flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--primary-light)' }}>
                <Icon className="h-5 w-5 text-emerald-600" />
              </div>
              <div><div className="font-semibold">{t}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d}</div></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
