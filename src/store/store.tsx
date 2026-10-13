import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Cliente, Orcamento, Produto, UserProfile } from '../types';
import { seedClientes, seedOrcamentos, seedProdutos, seedUserProfile } from '../data/seed';

interface Store {
  clientes: Cliente[];
  produtos: Produto[];
  orcamentos: Orcamento[];
  userProfile: UserProfile;
  isAuthenticated: boolean;
  saveCliente: (c: Cliente) => void;
  deleteCliente: (id: string) => void;
  saveProduto: (p: Produto) => void;
  deleteProduto: (id: string) => void;
  saveOrcamento: (o: Orcamento) => void;
  deleteOrcamento: (id: string) => void;
  saveUserProfile: (u: UserProfile) => void;
  login: (email?: string, nome?: string) => void;
  logout: () => void;
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
  const [clientes, setClientes] = usePersisted<Cliente[]>(
    'ec_clientes_v5',
    seedClientes,
    (list) => Array.isArray(list) && list.length >= 10
  );

  const [produtos, setProdutos] = usePersisted<Produto[]>(
    'ec_produtos_v5',
    seedProdutos,
    (list) => Array.isArray(list) && list.length >= 22
  );

  const [orcamentos, setOrcamentos] = usePersisted<Orcamento[]>(
    'ec_orcamentos_v5',
    seedOrcamentos,
    (list) => Array.isArray(list) && list.length >= 11 && list.some((o) => o.numero === 1004)
  );

  const [userProfile, setUserProfile] = usePersisted<UserProfile>(
    'ec_user_profile_v5',
    seedUserProfile,
    (u) => !!u && typeof u.nome === 'string' && !!u.preferencias
  );

  const [isAuthenticated, setIsAuthenticated] = usePersisted<boolean>('ec_auth_v5', true);

  const resetToOfficialData = useCallback(() => {
    setClientes(seedClientes);
    setProdutos(seedProdutos);
    setOrcamentos(seedOrcamentos);
    setUserProfile(seedUserProfile);
    localStorage.setItem('ec_clientes_v5', JSON.stringify(seedClientes));
    localStorage.setItem('ec_produtos_v5', JSON.stringify(seedProdutos));
    localStorage.setItem('ec_orcamentos_v5', JSON.stringify(seedOrcamentos));
    localStorage.setItem('ec_user_profile_v5', JSON.stringify(seedUserProfile));
  }, [setClientes, setProdutos, setOrcamentos, setUserProfile]);

  const login = useCallback(
    (email?: string, nome?: string) => {
      if (email || nome) {
        setUserProfile({
          ...userProfile,
          email: email || userProfile.email,
          nome: nome || userProfile.nome,
        });
      }
      setIsAuthenticated(true);
    },
    [userProfile, setUserProfile, setIsAuthenticated]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, [setIsAuthenticated]);

  const nextOrcamentoNumero = useCallback(
    () => orcamentos.reduce((m, o) => Math.max(m, o.numero), 1000) + 1,
    [orcamentos]
  );

  const store: Store = {
    clientes,
    produtos,
    orcamentos,
    userProfile,
    isAuthenticated,
    saveCliente: (c) => setClientes(upsert(clientes, c)),
    deleteCliente: (id) => setClientes(clientes.filter((c) => c.id !== id)),
    saveProduto: (p) => setProdutos(upsert(produtos, p)),
    deleteProduto: (id) => setProdutos(produtos.filter((p) => p.id !== id)),
    saveOrcamento: (o) => setOrcamentos(upsert(orcamentos, o)),
    deleteOrcamento: (id) => setOrcamentos(orcamentos.filter((o) => o.id !== id)),
    saveUserProfile: (u) => setUserProfile(u),
    login,
    logout,
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
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const num = (n: number, d = 2) =>
  (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

export const uid = () => Math.random().toString(36).slice(2, 10);
