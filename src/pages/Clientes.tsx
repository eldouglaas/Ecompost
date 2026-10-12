import { useState } from 'react';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { Field, Input, Modal, PageHeader, Pill, Select } from '../components/ui';
import { uid, useStore } from '../store/store';
import { Cliente } from '../types';

const empty = (): Cliente => ({ id: uid(), nome: '', cnpjCpf: '', contato: '', telefone: '', email: '', cidade: '', uf: '', status: 'Ativo' });

export default function Clientes() {
  const { clientes, saveCliente, deleteCliente } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [edit, setEdit] = useState<Cliente | null>(null);

  const list = clientes.filter(
    (c) =>
      (!status || c.status === status) &&
      `${c.nome} ${c.cidade} ${c.cnpjCpf}`.toLowerCase().includes(q.toLowerCase())
  );
  const set = (k: keyof Cliente) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEdit({ ...edit!, [k]: e.target.value } as Cliente);

  return (
    <div>
      <PageHeader
        icon={<Users />}
        title="Clientes"
        subtitle="Gestão de clientes e propriedades"
        action={<button className="btn-primary" onClick={() => setEdit(empty())}><Plus className="h-4 w-4" /> Novo Cliente</button>}
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Pill label="Total" value={clientes.length} color="#94a3b8" />
        <Pill label="Ativos" value={clientes.filter((c) => c.status === 'Ativo').length} color="#10b981" />
        <Pill label="Inativos" value={clientes.filter((c) => c.status === 'Inativo').length} color="#ef4444" />
        <div className="ml-auto flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente, cidade, CNPJ..." className="rounded-lg border py-2 pl-9 pr-3 text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', width: 280 }} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border px-3 text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <option value="">Todos status</option><option>Ativo</option><option>Inativo</option>
          </select>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Nome</th><th>CNPJ/CPF</th><th>Contato</th><th>Cidade/UF</th><th>Status</th><th /></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td className="font-semibold">{c.nome}</td>
                <td>{c.cnpjCpf}</td>
                <td>{c.telefone}<div className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.email}</div></td>
                <td>{c.cidade}/{c.uf}</td>
                <td><span className={c.status === 'Ativo' ? 'badge-active' : 'badge-canceled'}>{c.status}</span></td>
                <td className="whitespace-nowrap text-right">
                  <button className="mr-3" onClick={() => setEdit(c)}><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm(`Excluir ${c.nome}?`) && deleteCliente(c.id)}><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="text-center" style={{ color: 'var(--text-muted)' }}>Nenhum cliente encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {edit && (
        <Modal title={clientes.some((c) => c.id === edit.id) ? 'Editar Cliente' : 'Novo Cliente'} onClose={() => setEdit(null)}>
          <form
            className="grid grid-cols-2 gap-4"
            onSubmit={(e) => { e.preventDefault(); saveCliente(edit); setEdit(null); }}
          >
            <div className="col-span-2"><Field label="Nome *"><Input required value={edit.nome} onChange={set('nome')} /></Field></div>
            <Field label="CNPJ/CPF"><Input value={edit.cnpjCpf} onChange={set('cnpjCpf')} /></Field>
            <Field label="Contato"><Input value={edit.contato} onChange={set('contato')} /></Field>
            <Field label="Telefone"><Input value={edit.telefone} onChange={set('telefone')} /></Field>
            <Field label="Email"><Input type="email" value={edit.email} onChange={set('email')} /></Field>
            <Field label="Cidade"><Input value={edit.cidade} onChange={set('cidade')} /></Field>
            <Field label="UF"><Input maxLength={2} value={edit.uf} onChange={set('uf')} /></Field>
            <Field label="Status"><Select value={edit.status} onChange={set('status')}><option>Ativo</option><option>Inativo</option></Select></Field>
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
