import { ItemReceitaComposto, Produto } from '../types';

export function calculateAreaSecaoLeira(baseMaiorM: number, baseMenorM: number, alturaM: number): number {
  if (alturaM <= 0) return 0;
  return ((baseMaiorM + baseMenorM) / 2) * alturaM;
}

export function calculateExtensaoTotalLeiras(volumeM3: number, secaoM2: number): number {
  if (secaoM2 <= 0) return 0;
  return Math.round(volumeM3 / secaoM2);
}

export function calculateNrLeiras(extensaoTotalM: number, extensaoPorLeiraM: number): number {
  if (extensaoPorLeiraM <= 0) return 0;
  return Number((extensaoTotalM / extensaoPorLeiraM).toFixed(1));
}

export function calculateReceitaMetrics(
  itens: ItemReceitaComposto[],
  produtosCatalogo: Produto[],
  doseMetaTn: number = 6000
) {
  const massaTotalOriginal = itens.reduce((acc, item) => acc + item.quantidadeTn, 0);
  const massaSecaInicial = itens.reduce((acc, item) => acc + item.massaSecaTn, 0);
  const custoProdutos = itens.reduce((acc, item) => acc + item.subtotal, 0);

  let carbonoTotal = 0;
  let nitrogenioTotal = 0;
  let somaDensidadePonderada = 0;

  itens.forEach((item) => {
    const prod = produtosCatalogo.find((p) => p.id === item.produtoId);
    const densidade = prod?.densidadeTnM3 || 0.72;
    somaDensidadePonderada += densidade * item.quantidadeTn;

    const cPct = prod?.nutrientes.c_pct || 35; // Default C% em matéria orgânica
    const nPct = prod?.nutrientes.n_pct || 1.8; // Default N%

    // Carbono e nitrogênio calculados sobre a massa seca
    carbonoTotal += item.massaSecaTn * (cPct / 100);
    nitrogenioTotal += item.massaSecaTn * (nPct / 100);
  });

  const densidadeMedia = massaTotalOriginal > 0
    ? Number((somaDensidadePonderada / massaTotalOriginal).toFixed(2))
    : 0.72;

  const relacaoCN = nitrogenioTotal > 0
    ? Number((carbonoTotal / nitrogenioTotal).toFixed(1))
    : 22.1;

  // Mineralização padrão (~40% perda de matéria orgânica durante o ciclo termófilo)
  const massaSecaFinal = Number((massaSecaInicial * 0.70).toFixed(2));
  const massaSugeridaMeta = Number((doseMetaTn * 1.16).toFixed(2));
  const eficienciaPct = doseMetaTn > 0 ? Math.round((massaTotalOriginal / doseMetaTn) * 100) : 100;
  const perdaMineralizacaoTn = Number(Math.max(0, massaSecaInicial - massaSecaFinal).toFixed(2));

  // Volume total estimado do pátio
  const volumeTotalM3 = densidadeMedia > 0 ? massaTotalOriginal / densidadeMedia : 0;

  return {
    massaTotalOriginal,
    massaSecaInicial,
    custoProdutos,
    carbonoTotal: Number(carbonoTotal.toFixed(2)),
    nitrogenioTotal: Number(nitrogenioTotal.toFixed(2)),
    densidadeMedia,
    relacaoCN,
    massaSecaFinal,
    massaSugeridaMeta,
    eficienciaPct,
    perdaMineralizacaoTn,
    volumeTotalM3: Math.round(volumeTotalM3),
    cicloDias: 56
  };
}

export function calculateFinanceiro(
  pesoFinalTn: number,
  areaHa: number,
  custoOperacionalPorTn: number,
  assessoria: number,
  locacao: number,
  custoProdutos: number
) {
  const custoOperacionalTotal = pesoFinalTn * custoOperacionalPorTn;
  const custoTotal = custoOperacionalTotal + assessoria + locacao + custoProdutos;
  const valorPorTn = pesoFinalTn > 0 ? Number((custoTotal / pesoFinalTn).toFixed(2)) : 0;
  const valorPorHa = areaHa > 0 ? Number((custoTotal / areaHa).toFixed(2)) : 0;

  return {
    custoOperacionalTotal,
    custoTotal,
    valorPorTn,
    valorPorHa
  };
}
