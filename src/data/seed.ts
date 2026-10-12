import { Cliente, Orcamento, Produto } from '../types';

export const seedClientes: Cliente[] = [
  { id: 'c1', nome: 'LOURENÇO SAUER', cnpjCpf: '070.345.146-40', contato: 'Lourenço', telefone: '38999763683', email: '', cidade: 'CABECEIRA GRANDE', uf: 'MG', status: 'Ativo' },
  { id: 'c2', nome: 'Granja Irmãos Silva', cnpjCpf: '23.456.789/0001-44', contato: 'Silva', telefone: '(45) 99877-6543', email: 'contato@silva.com.br', cidade: 'Cascavel', uf: 'PR', status: 'Ativo' },
  { id: 'c3', nome: 'Fazenda Três Marias', cnpjCpf: '34.567.890/0001-66', contato: 'Admin', telefone: '(67) 99855-4433', email: 'admin@tresmarias.com.br', cidade: 'Dourados', uf: 'MS', status: 'Ativo' },
  { id: 'c4', nome: 'BioAgro Cerrado', cnpjCpf: '67.890.123/0001-55', contato: 'Prod', telefone: '(62) 99866-5544', email: 'prod@bioagro.com.br', cidade: 'Goiânia', uf: 'GO', status: 'Ativo' },
  { id: 'c5', nome: 'Fazenda Boa Vista', cnpjCpf: '98.765.432/0001-22', contato: 'Gestão', telefone: '(34) 99812-3456', email: 'gestao@boavista.com.br', cidade: 'Uberaba', uf: 'MG', status: 'Ativo' },
  { id: 'c6', nome: 'Cooperativa Vale Verde', cnpjCpf: '45.678.901/0001-33', contato: 'Diretoria', telefone: '(43) 99988-7766', email: 'diretoria@valeverde.coop.br', cidade: 'Londrina', uf: 'PR', status: 'Ativo' },
  { id: 'c7', nome: 'Agropecuária Santa Helena', cnpjCpf: '12.345.678/0001-10', contato: 'Contato', telefone: '(16) 99876-5432', email: 'contato@santahelena.com.br', cidade: 'Ribeirão Preto', uf: 'SP', status: 'Ativo' },
  { id: 'c8', nome: 'Fazenda Modelo Exemplo', cnpjCpf: '12.345.678/0001-90', contato: 'Contato', telefone: '(11) 99999-9999', email: 'contato@fazendamodelo.com.br', cidade: 'Ribeirão Preto', uf: 'SP', status: 'Ativo' },
];

const p = (id: string, nome: string, clienteId: string, tipo: Produto['tipo'], valor: number, umid: number, n: Produto['nutrientes'], dens = 0.72): Produto => ({
  id, nome, clienteId, tipo, unidade: 'TN', valorUnitario: valor, umidadePct: umid, densidadeTnM3: dens, nutrientes: n,
});

export const seedProdutos: Produto[] = [
  p('p1', 'ESTERCO BOVINO', 'c1', 'Orgânico', 100, 45, { c_pct: 30, n_pct: 1.6, p2o5_pct: 1.2, k2o_pct: 1.0, ca_pct: 1.5 }),
  p('p2', 'PÓ DE SERRA', 'c1', 'Orgânico', 350, 20, { c_pct: 50, n_pct: 0.2, ca_pct: 0.4 }, 0.3),
  p('p3', 'Fusion P14 Plus', 'c1', 'Mineral', 705, 0, { p2o5_pct: 14, ca_pct: 12, s_pct: 5, si_pct: 3 }, 1.1),
  p('p4', 'Cama de Frango', 'c2', 'Orgânico', 90, 35, { c_pct: 35, n_pct: 3, p2o5_pct: 3, k2o_pct: 2.5, ca_pct: 2 }),
  p('p5', 'Cinza Vegetal', 'c6', 'Mineral', 150, 10, { k2o_pct: 5, ca_pct: 20, mg_pct: 3, p2o5_pct: 2 }, 0.6),
  p('p6', 'Calcário Dolomítico', 'c3', 'Mineral', 180, 5, { ca_pct: 24, mg_pct: 12 }, 1.3),
  p('p7', 'Casca de Café', 'c7', 'Orgânico', 80, 55, { c_pct: 40, n_pct: 1.9, k2o_pct: 3 }),
  p('p8', 'Composto Maturado', 'c7', 'Orgânico', 200, 30, { c_pct: 25, n_pct: 1.8, p2o5_pct: 1.5 }),
  p('p9', 'Batata - Resíduos', 'c8', 'Orgânico', 0, 80, { c_pct: 40, n_pct: 2 }),
  p('p10', 'Boro Ulexita', 'c8', 'Mineral', 3600, 0, { b_ppm: 100000, ca_pct: 10 }, 1),
  p('p11', 'Bacillus Mix', 'c4', 'Biológico', 40, 0, {}),
  p('p12', 'Trichoderma', 'c4', 'Biológico', 60, 0, {}),
];

export const seedOrcamentos: Orcamento[] = [];
