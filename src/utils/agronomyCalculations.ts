import { ComposicaoNutricional, ItemReceitaComposto, Produto } from '../types';

export function calculateAreaSecaoLeira(baseMaiorM: number, baseMenorM: number, alturaM: number): number {
  if (alturaM <= 0) return 0;
  return Number((((baseMaiorM + baseMenorM) / 2) * alturaM).toFixed(4));
}

export function calculateExtensaoTotalLeiras(volumeM3: number, secaoM2: number): number {
  if (secaoM2 <= 0) return 0;
  return volumeM3 / secaoM2;
}

export function calculateNrLeiras(extensaoTotalM: number, extensaoPorLeiraM: number): number {
  if (extensaoPorLeiraM <= 0) return 0;
  return extensaoTotalM / extensaoPorLeiraM;
}

/**
 * Motor oficial de cálculo agronômico e engenharia do composto (fiel à função G6 do Ecompost Base44)
 */
export function calculateReceitaMetrics(
  itens: ItemReceitaComposto[],
  produtosCatalogo: Produto[],
  pesoFinalTn: number = 6000,
  umidadeFinalPct: number = 30,
  secaoM2: number = 7.2,
  areaHa: number = 1000,
  doseCompostoTnHa: number = 6
) {
  let massaTotalOriginal = 0;
  let massaSecaInicial = 0;
  let custoProdutos = 0;
  let volumeTotalM3 = 0;

  let carbonoTotal = 0;
  let nitrogenioTotal = 0;
  let somaDensidadePonderadaSeca = 0;

  // Passo 1: processamento por ingrediente (idêntico ao G6)
  const itensProcessados = itens.map((item) => {
    const prod = produtosCatalogo.find((p) => p.id === item.produtoId);
    const qtdOrig = Number(item.quantidadeTn) || 0;
    const umid = prod ? Number(prod.umidadePct) || 0 : Number(item.umidadePct) || 0;
    const tipo = prod ? prod.tipo : item.tipo;
    const dens = prod && prod.densidadeTnM3 ? Number(prod.densidadeTnM3) : tipo === 'Mineral' ? 1.0 : 0.5;
    const valorUnit = prod ? Number(prod.valorUnitario) || 0 : Number(item.valorUnitario) || 0;

    const volMatSeca = qtdOrig * (1 - umid / 100);
    const volM3 = dens > 0 ? qtdOrig / dens : 0;
    const subtotal = qtdOrig * valorUnit;

    massaTotalOriginal += qtdOrig;
    massaSecaInicial += volMatSeca;
    custoProdutos += subtotal;
    volumeTotalM3 += volM3;

    const cPct =
      prod && prod.nutrientes.c_pct !== undefined
        ? Number(prod.nutrientes.c_pct)
        : tipo === 'Orgânico'
        ? 45
        : 0;
    const nPct = prod && prod.nutrientes.n_pct ? Number(prod.nutrientes.n_pct) : 0;

    carbonoTotal += volMatSeca * (cPct / 100);
    nitrogenioTotal += volMatSeca * (nPct / 100);
    somaDensidadePonderadaSeca += volMatSeca * dens;

    return {
      ...item,
      quantidadeTn: qtdOrig,
      umidadePct: umid,
      massaSecaTn: volMatSeca,
      volumeM3: volM3,
      valorUnitario: valorUnit,
      subtotal,
    };
  });

  const extensaoTotalExact = secaoM2 > 0 ? volumeTotalM3 / secaoM2 : 0;

  const itensComRateio = itensProcessados.map((it) => ({
    ...it,
    percentual: custoProdutos > 0 ? (it.subtotal / custoProdutos) * 100 : 0,
    custoHa: areaHa > 0 ? it.subtotal / areaHa : 0,
    kgPorMetro: extensaoTotalExact > 0 ? (it.quantidadeTn * 1000) / extensaoTotalExact : 0,
  }));

  const totalKgPorMetro = itensComRateio.reduce((acc, it) => acc + (it.kgPorMetro || 0), 0);

  // Relação C:N e Status (fiel ao G6)
  const relacaoCN = nitrogenioTotal > 0 ? Number((carbonoTotal / nitrogenioTotal).toFixed(1)) : 0;
  const relacaoCNExact = nitrogenioTotal > 0 ? carbonoTotal / nitrogenioTotal : 0;

  let statusCN = '—';
  if (nitrogenioTotal > 0) {
    if (relacaoCNExact >= 25 && relacaoCNExact <= 30) {
      statusCN = 'Ótimo';
    } else if (relacaoCNExact < 25) {
      statusCN = 'Déficit de carbono';
    } else {
      statusCN = 'Excesso de carbono';
    }
  }

  // Densidade média ponderada pela matéria seca (fiel ao G6)
  const densidadeMedia =
    massaSecaInicial > 0 ? Number((somaDensidadePonderadaSeca / massaSecaInicial).toFixed(3)) : 0;

  // Balanço de Massa — Mineralização (fiel ao G6)
  const massaSecaFinal = Number((pesoFinalTn * (1 - (Number(umidadeFinalPct) || 0) / 100)).toFixed(2));
  const massaSugeridaMeta = Number((massaSecaFinal / 0.6).toFixed(2));
  const eficienciaConversaoExact = massaSecaInicial > 0 ? (massaSecaFinal / massaSecaInicial) * 100 : 0;
  const eficienciaPct = Number(eficienciaConversaoExact.toFixed(1));
  const perdaMassaPct =
    massaSecaInicial > 0 ? Number(Math.max(0, 100 - eficienciaConversaoExact).toFixed(1)) : 0;
  const perdaMineralizacaoTn = Number(Math.max(0, massaSecaInicial - massaSecaFinal).toFixed(2));

  // Dias de ciclo estimados (fiel ao G6)
  let cicloDias = 0;
  if (relacaoCNExact > 0) {
    if (relacaoCNExact >= 25 && relacaoCNExact <= 30) {
      cicloDias = 60;
    } else if (relacaoCNExact > 30) {
      cicloDias = Math.round(Math.min(120, 60 + (relacaoCNExact - 30) * 2));
    } else {
      cicloDias = Math.round(Math.max(45, 60 - (25 - relacaoCNExact) * 1.5));
    }
  }

  // Garantias nutricionais (média ponderada pelo volume_mat_original, fiel a W6 e T_e no G6)
  const macroKeys: (keyof ComposicaoNutricional)[] = [
    'n_pct',
    'p2o5_pct',
    'k2o_pct',
    'ca_pct',
    'mg_pct',
    's_pct',
    'si_pct',
  ];
  const microKeys: (keyof ComposicaoNutricional)[] = [
    'mn_ppm',
    'zn_ppm',
    'co_ppm',
    'cu_ppm',
    'mo_ppm',
    'b_ppm',
  ];

  const garantias: Record<keyof ComposicaoNutricional, number> = {} as Record<keyof ComposicaoNutricional, number>;
  const kgHaNutrientes: Record<keyof ComposicaoNutricional, number> = {} as Record<keyof ComposicaoNutricional, number>;

  [...macroKeys, ...microKeys].forEach((k) => {
    if (massaTotalOriginal <= 0) {
      garantias[k] = 0;
      kgHaNutrientes[k] = 0;
      return;
    }
    let soma = 0;
    itensComRateio.forEach((it) => {
      const prod = produtosCatalogo.find((p) => p.id === it.produtoId);
      const val = prod?.nutrientes[k] || 0;
      soma += it.quantidadeTn * val;
    });
    const mediaPonderada = soma / massaTotalOriginal;
    garantias[k] = mediaPonderada;
    if (macroKeys.includes(k)) {
      // (garantia / 100) * dose * 1000
      kgHaNutrientes[k] = (mediaPonderada / 100) * doseCompostoTnHa * 1000;
    } else {
      // (garantia_ppm * dose) / 1000
      kgHaNutrientes[k] = (mediaPonderada * doseCompostoTnHa) / 1000;
    }
  });

  return {
    massaTotalOriginal: Number(massaTotalOriginal.toFixed(2)),
    massaSecaInicial: Number(massaSecaInicial.toFixed(2)),
    custoProdutos: Number(custoProdutos.toFixed(2)),
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
    volumeTotalM3,
    extensaoTotalExact,
    totalKgPorMetro,
    cicloDias,
    itensComRateio,
    garantias,
    kgHaNutrientes,
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
  const custoTotal = custoOperacionalTotal + (assessoria || 0) + (locacao || 0) + custoProdutos;
  const valorPorTn = pesoFinalTn > 0 ? Number((custoTotal / pesoFinalTn).toFixed(2)) : 0;
  const valorPorHa = areaHa > 0 ? Number((custoTotal / areaHa).toFixed(2)) : 0;

  return {
    custoOperacionalTotal,
    custoTotal,
    valorPorTn,
    valorPorHa,
  };
}
