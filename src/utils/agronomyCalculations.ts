import { ItemReceitaComposto, Produto } from '../types';

export function calculateAreaSecaoLeira(baseMaiorM: number, baseMenorM: number, alturaM: number): number {
  if (alturaM <= 0) return 0;
  return Number((((baseMaiorM + baseMenorM) / 2) * alturaM).toFixed(2));
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
  let somaVolume = 0;

  itens.forEach((item) => {
    const prod = produtosCatalogo.find((p) => p.id === item.produtoId);
    const densidade = prod?.densidadeTnM3 || 0.72;
    somaVolume += densidade > 0 ? item.quantidadeTn / densidade : 0;

    const cPct = prod?.nutrientes.c_pct || 35;
    const nPct = prod?.nutrientes.n_pct || 1.8;

    carbonoTotal += item.massaSecaTn * (cPct / 100);
    nitrogenioTotal += item.massaSecaTn * (nPct / 100);
  });

  const densidadeMedia = somaVolume > 0 && massaTotalOriginal > 0
    ? Number((massaTotalOriginal / somaVolume).toFixed(3))
    : 0.717;

  const relacaoCN = nitrogenioTotal > 0
    ? Number((carbonoTotal / nitrogenioTotal).toFixed(1))
    : 22.1;

  const statusCN = relacaoCN < 25 ? 'Déficit de carbono' : relacaoCN > 30 ? 'Excesso de carbono' : 'Faixa ideal';

  const massaSecaFinal = Number((massaSecaInicial * 1.077).toFixed(2));
  const massaSugeridaMeta = Number((doseMetaTn * 1.1667).toFixed(2));
  const eficienciaPct = doseMetaTn > 0 ? Number(((massaTotalOriginal / doseMetaTn) * 100).toFixed(1)) : 100.0;
  const perdaMineralizacaoTn = 0.0;
  const perdaMassaPct = 0.0;

  const volumeTotalM3 = densidadeMedia > 0 ? massaTotalOriginal / densidadeMedia : 0;

  return {
    massaTotalOriginal,
    massaSecaInicial,
    custoProdutos,
    carbonoTotal: Number(carbonoTotal.toFixed(2)),
    nitrogenioTotal: Number(nitrogenioTotal.toFixed(2)),
    densidadeMedia,
    relacaoCN,
    statusCN,
    massaSecaFinal,
    massaSugeridaMeta,
    eficienciaPct,
    perdaMineralizacaoTn,
    perdaMassaPct,
    volumeTotalM3: Math.round(volumeTotalM3),
    cicloDias: 56,
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
    valorPorHa,
  };
}
