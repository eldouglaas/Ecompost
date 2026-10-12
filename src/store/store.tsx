import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Cliente, Orcamento, Produto } from '../types';
import { seedClientes, seedOrcamentos, seedProdutos } from '../data/seed';

interface Store {
  clientes: Cliente[];
  produtos: Produto[];
  orcamentos: Orcamento[];
  saveCliente: (c: Cliente) => void;
  deleteCliente: (id: string) => void;
  saveProduto: (p: Produto) => void;
  deleteProduto: (id: string) => void;
  saveOrcamento: (o: Orcamento) => void;
  deleteOrcamento: (id: string) => void;
  nextOrcamentoNumero: () => number;
  resetToOfficialData: () => void;
}

const Ctx = createContext<Store | null>(null);

function usePersisted<T>(key: string, initial: T, validator?: (val: T) => boolean): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial;
      const parsed = JSON.parse(raw) as T;
      if (validator && !validator(parsed)) {
        return initial;
      }
      return parsed;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(val));
  }, [key, val]);

  return [val, setVal];
}

const upsert = <T extends { id: string }>(list: T[], item: T) =>
  list.some((i) => i.id === item.id) ? list.map((i) => (i.id === item.id ? item : i)) : [...list, item];

export function StoreProvider({ children }: { children: ReactNode }) {
  // Se os dados em cache forem antigos (menos de 10 clientes, menos de 22 produtos ou menos de 11 orçamentos),
  // carrega automaticamente os dados oficiais do Base44!
  const [clientes, setClientes] = usePersisted<Cliente[]>(
    'ec_clientes_v4',
    seedClientes,
    (list) => Array.isArray(list) && list.length >= 10
  );

  const [produtos, setProdutos] = usePersisted<Produto[]>(
    'ec_produtos_v4',
    seedProdutos,
    (list) => Array.isArray(list) && list.length >= 22
  );

  const [orcamentos, setOrcamentos] = usePersisted<Orcamento[]>(
    'ec_orcamentos_v4',
    seedOrcamentos,
    (list) => Array.isArray(list) && list.length >= 11 && list.some((o) => o.numero === 1004)
  );

  const resetToOfficialData = useCallback(() => {
    setClientes(seedClientes);
    setProdutos(seedProdutos);
    setOrcamentos(seedOrcamentos);
    localStorage.setItem('ec_clientes_v4', JSON.stringify(seedClientes));
    localStorage.setItem('ec_produtos_v4', JSON.stringify(seedProdutos));
    localStorage.setItem('ec_orcamentos_v4', JSON.stringify(seedOrcamentos));
  }, [setClientes, setProdutos, setOrcamentos]);

  const nextOrcamentoNumero = useCallback(
    () => orcamentos.reduce((m, o) => Math.max(m, o.numero), 1000) + 1,
    [orcamentos]
  );

  const store: Store = {
    clientes,
    produtos,
    orcamentos,
    saveCliente: (c) => setClientes(upsert(clientes, c)),
    deleteCliente: (id) => setClientes(clientes.filter((c) => c.id !== id)),
    saveProduto: (p) => setProdutos(upsert(produtos, p)),
    deleteProduto: (id) => setProdutos(produtos.filter((p) => p.id !== id)),
    saveOrcamento: (o) => setOrcamentos(upsert(orcamentos, o)),
    deleteOrcamento: (id) => setOrcamentos(orcamentos.filter((o) => o.id !== id)),
    nextOrcamentoNumero,
    resetToOfficialData,
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}

export const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const num = (n: number, d = 2) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

export const uid = () => Math.random().toString(36).slice(2, 10);
