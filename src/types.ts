export type StatusCliente = 'Ativo' | 'Inativo';
export type TipoProduto = 'Orgânico' | 'Mineral' | 'Biológico';
export type SituacaoOrcamento = 'Aberto' | 'Aprovado' | 'Cancelado';

export interface UserProfile {
  id: string;
  nome: string;
  cpf?: string;
  email: string;
  cargo: string;
  registroProfissional: string; // CREA / CFTA (opcional)
  telefone: string;
  empresaFazenda: string;
  cidade: string;
  uf: string;
  avatarUrl?: string;
  nivelAcesso?: 'Administrador' | 'Consultor Técnico' | 'Produtor Rural' | 'Operador de Pátio';
  statusAcesso?: 'Ativo' | 'Pendente' | 'Bloqueado';
  permissoes?: string[];
  preferencias: {
    consultorPadrao: string;
    umidadeFinalPadrao: number;
    leiraAlturaPadrao: number;
    leiraBaseMenorPadrao: number;
    leiraBaseMaiorPadrao: number;
    leiraExtensaoPadrao: number;
    capacidadeConchaM3: number;
  };
}

export interface Cliente {
  id: string;
  nome: string;
  cnpjCpf: string;
  contato: string;
  telefone: string;
  email: string;
  cidade: string;
  uf: string;
  status: StatusCliente;
}

export interface ComposicaoNutricional {
  c_pct?: number; // Carbono orgânico %
  n_pct?: number; // Nitrogênio %
  p2o5_pct?: number; // Fósforo %
  k2o_pct?: number; // Potássio %
  ca_pct?: number; // Cálcio %
  mg_pct?: number; // Magnésio %
  s_pct?: number; // Enxofre %
  si_pct?: number; // Silício %
  mn_ppm?: number; // Manganês (ppm)
  zn_ppm?: number; // Zinco (ppm)
  b_ppm?: number; // Boro (ppm)
  cu_ppm?: number; // Cobre (ppm)
  mo_ppm?: number; // Molibdênio (ppm)
  co_ppm?: number; // Cobalto (ppm)
}

export interface Produto {
  id: string;
  nome: string;
  clienteId?: string;
  clienteNome?: string;
  tipo: TipoProduto;
  unidade: string;
  valorUnitario: number;
  umidadePct: number;
  densidadeTnM3: number;
  nutrientes: ComposicaoNutricional;
}

export interface ItemReceitaComposto {
  id: string;
  produtoId: string;
  produtoNome: string;
  tipo: TipoProduto;
  quantidadeTn: number;
  umidadePct: number;
  massaSecaTn: number;
  percentual: number;
  valorUnitario: number;
  subtotal: number;
  kgPorMetro?: number;
  custoHa?: number;
  volumeM3?: number;
}

export interface MedicaoLeiraPonto {
  id: string;
  data: string;
  leiraNumero: number;
  ponto1: number;
  ponto2: number;
  ponto3: number;
  media: number;
  umidadePct: number;
  aguaRevolvimento: string;
}

export interface Orcamento {
  id: string;
  numero: number;
  data: string;
  clienteId: string;
  clienteNome: string;
  consultor: string;
  propriedade: string;
  descricao: string;

  // Parâmetros Técnicos
  umidadeFinalPct: number;
  doseCompostoTnHa: number;
  areaHa: number;
  pesoFinalTn: number;

  // Dimensionamento das Leiras
  leiraAlturaM: number;
  leiraBaseMenorM: number;
  leiraBaseMaiorM: number;
  leiraExtensaoM: number;
  secaoM2: number;
  extensaoTotalM: number;
  nrLeiras: number;

  // Receita e Engenharia do Composto
  itens: ItemReceitaComposto[];
  relacaoCN: number;
  statusCN?: string;
  carbonoTotalTn: number;
  nitrogenioTotalTn: number;
  densidadeMedia: number;
  massaSecaInicialTn: number;
  massaSecaFinalTn: number;
  massaSugeridaMetaTn: number;
  eficienciaPct: number;
  perdaMineralizacaoTn: number;
  perdaMassaPct?: number;
  cicloDias: number;

  // Resumo Financeiro
  custoOperacionalPorTn: number;
  assessoriaTotal: number;
  locacaoEquipamentos: number;
  custoProdutos: number;
  custoTotal: number;
  valorPorTn: number;
  valorPorHa: number;
  situacao: SituacaoOrcamento;

  // Medições registradas das Leiras
  medicoesLeiras?: MedicaoLeiraPonto[];
}
