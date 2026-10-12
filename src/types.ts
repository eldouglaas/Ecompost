export type StatusCliente = 'Ativo' | 'Inativo';
export type TipoProduto = 'Orgânico' | 'Mineral' | 'Biológico';
export type SituacaoOrcamento = 'Aberto' | 'Aprovado' | 'Cancelado';

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
}

export interface LeituraMonitoramento {
  id: string;
  data: string;
  diaCiclo: number;
  temperaturaC: number;
  umidadePct: number;
  reviramento: boolean;
  observacao?: string;
}

export interface LeiraData {
  numero: number;
  comprimentoM: number;
  alturaM: number;
  baseMaiorM: number;
  baseMenorM: number;
  volumeM3: number;
  massaEstimadaTn: number;
  dataInicio: string;
  fase: 'Mesófilo' | 'Termófilo' | 'Maturação';
  leituras: LeituraMonitoramento[];
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
  
  // Passo 2: Tamanho e Dose
  umidadeFinalPct: number;
  doseCompostoTnHa: number;
  areaHa: number;
  pesoFinalTn: number;

  // Tamanho das Leiras
  leiraAlturaM: number;
  leiraBaseMenorM: number;
  leiraBaseMaiorM: number;
  leiraExtensaoM: number;
  secaoM2: number;
  extensaoTotalM: number;
  nrLeiras: number;

  // Passo 3: Receita e Engenharia
  itens: ItemReceitaComposto[];
  relacaoCN: number;
  carbonoTotalTn: number;
  nitrogenioTotalTn: number;
  densidadeMedia: number;
  massaSecaInicialTn: number;
  massaSecaFinalTn: number;
  massaSugeridaMetaTn: number;
  eficienciaPct: number;
  perdaMineralizacaoTn: number;
  cicloDias: number;

  // Passo 4: Custos
  custoOperacionalPorTn: number;
  assessoriaTotal: number;
  locacaoEquipamentos: number;
  custoProdutos: number;
  custoTotal: number;
  valorPorTn: number;
  valorPorHa: number;
  situacao: SituacaoOrcamento;

  // Leiras geradas para monitoramento
  leiras?: LeiraData[];
}
