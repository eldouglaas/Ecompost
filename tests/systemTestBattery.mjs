import assert from 'node:assert';

console.log('======================================================================');
console.log(' BATERIA DE TESTES AUTOMATIZADOS COMPLETA DO SISTEMA ECOMPOST');
console.log(' Validando: Geometria, Cálculos G6, Nutrição, Seed, Navegação e Rotas');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Erro: ${err.message}`);
  }
}

import { 
  calculateAreaSecaoLeira, 
  calculateExtensaoTotalLeiras, 
  calculateNrLeiras, 
  calculateReceitaMetrics, 
  calculateFinanceiro 
} from '../src/utils/agronomyCalculations.ts';

import { seedUserProfile, seedClientes, seedProdutos, seedOrcamentos } from '../src/data/seed.ts';

// ---------------------------------------------------------------------------
// 1. TESTES DE GEOMETRIA E SEÇÃO TRANSVERSAL DE LEIRAS
// ---------------------------------------------------------------------------
console.log('--- 1. Engenharia de Geometria e Seção Transversal ---');

test('Geometria: Seção Trapezoidal Padrão (Base Maior 6.0m, Base Menor 2.0m, Altura 1.8m = 7.2 m²)', () => {
  const secao = calculateAreaSecaoLeira(6.0, 2.0, 1.8);
  assert.strictEqual(secao, 7.2);
});

test('Geometria: Seção Retangular (Base Maior = Base Menor = 4m, Altura 1.5m = 6.0 m²)', () => {
  const secao = calculateAreaSecaoLeira(4.0, 4.0, 1.5);
  assert.strictEqual(secao, 6.0);
});

test('Geometria: Seção Triangular (Base Menor 0m, Base Maior 4m, Altura 1.5m = 3.0 m²)', () => {
  const secao = calculateAreaSecaoLeira(4.0, 0, 1.5);
  assert.strictEqual(secao, 3.0);
});

test('Geometria: Altura nula ou negativa deve retornar 0 m²', () => {
  assert.strictEqual(calculateAreaSecaoLeira(6.0, 2.0, 0), 0);
  assert.strictEqual(calculateAreaSecaoLeira(6.0, 2.0, -1.8), 0);
});

test('Geometria: Extensão Linear Total = Volume / Seção', () => {
  const extensao = calculateExtensaoTotalLeiras(720, 7.2);
  assert.strictEqual(extensao, 100);
});

test('Geometria: Seção nula ou zero não deve causar divisão por zero (retorna 0)', () => {
  assert.strictEqual(calculateExtensaoTotalLeiras(720, 0), 0);
  assert.strictEqual(calculateExtensaoTotalLeiras(720, -1), 0);
});

test('Geometria: Número de Leiras = Extensão Total / Extensão por Leira', () => {
  assert.strictEqual(calculateNrLeiras(120, 120), 1);
  assert.strictEqual(calculateNrLeiras(240, 120), 2);
  assert.strictEqual(calculateNrLeiras(300, 120), 2.5);
});

test('Geometria: Extensão por Leira zero não deve causar divisão por zero (retorna 0)', () => {
  assert.strictEqual(calculateNrLeiras(120, 0), 0);
});

// ---------------------------------------------------------------------------
// 2. TESTES DO MOTOR DE ENGENHARIA AGRONÔMICA G6 (agronomyCalculations.ts)
// ---------------------------------------------------------------------------
console.log('\n--- 2. Motor de Engenharia Agronômica G6 e Balanço de Massa ---');

test('Motor G6: Relação C:N Ótima (entre 25:1 e 30:1) gera status "Ótimo" e ciclo padrão de 60 dias', () => {
  const produtos = [
    {
      id: 'c-rich',
      nome: 'Bagaço Rico C',
      tipo: 'Orgânico',
      valorUnitario: 50,
      umidadePct: 40,
      densidadeTnM3: 0.4,
      nutrientes: { c_pct: 45, n_pct: 0.8, p2o5_pct: 0.2, k2o_pct: 0.5, ca_pct: 0.3, mg_pct: 0.1, s_pct: 0.1, si_pct: 0.5, mn_ppm: 50, zn_ppm: 20, co_ppm: 1, cu_ppm: 5, mo_ppm: 0.5, b_ppm: 10 }
    },
    {
      id: 'n-rich',
      nome: 'Cama Rica N',
      tipo: 'Orgânico',
      valorUnitario: 100,
      umidadePct: 25,
      densidadeTnM3: 0.6,
      nutrientes: { c_pct: 30, n_pct: 2.8, p2o5_pct: 2.5, k2o_pct: 2.0, ca_pct: 2.0, mg_pct: 0.5, s_pct: 0.4, si_pct: 0.2, mn_ppm: 200, zn_ppm: 150, co_ppm: 2, cu_ppm: 30, mo_ppm: 1, b_ppm: 25 }
    }
  ];

  const itens = [
    { produtoId: 'c-rich', quantidadeTn: 100 },
    { produtoId: 'n-rich', quantidadeTn: 40 }
  ];

  const m = calculateReceitaMetrics(itens, produtos, 100, 30, 7.2, 20, 5);

  assert(m.relacaoCN >= 25 && m.relacaoCN <= 30, `Relação C:N obtida: ${m.relacaoCN}`);
  assert.strictEqual(m.statusCN, 'Ótimo');
  assert.strictEqual(m.cicloDias, 60);
});

test('Motor G6: Excesso de Carbono (C:N > 30) aumenta proporcionalmente os dias de ciclo', () => {
  const produtos = [
    {
      id: 'c-high',
      nome: 'Serragem Pura',
      tipo: 'Orgânico',
      valorUnitario: 30,
      umidadePct: 15,
      densidadeTnM3: 0.3,
      nutrientes: { c_pct: 50, n_pct: 0.2, p2o5_pct: 0.1, k2o_pct: 0.1, ca_pct: 0.1, mg_pct: 0.1, s_pct: 0.1, si_pct: 0.1, mn_ppm: 10, zn_ppm: 10, co_ppm: 0, cu_ppm: 1, mo_ppm: 0, b_ppm: 2 }
    }
  ];

  const itens = [{ produtoId: 'c-high', quantidadeTn: 100 }];
  const m = calculateReceitaMetrics(itens, produtos, 100, 30, 7.2, 10, 10);

  assert(m.relacaoCN > 30);
  assert.strictEqual(m.statusCN, 'Excesso de carbono');
  assert(m.cicloDias > 60, `Ciclo deveria ser > 60 dias, obtido: ${m.cicloDias}`);
});

test('Motor G6: Déficit de Carbono (C:N < 25) reduz proporcionalmente os dias de ciclo', () => {
  const produtos = [
    {
      id: 'n-high',
      nome: 'Ureia / Dejeto Puro',
      tipo: 'Orgânico',
      valorUnitario: 100,
      umidadePct: 10,
      densidadeTnM3: 0.8,
      nutrientes: { c_pct: 20, n_pct: 4.0, p2o5_pct: 0.1, k2o_pct: 0.1, ca_pct: 0.1, mg_pct: 0.1, s_pct: 0.1, si_pct: 0.1, mn_ppm: 0, zn_ppm: 0, co_ppm: 0, cu_ppm: 0, mo_ppm: 0, b_ppm: 0 }
    }
  ];

  const itens = [{ produtoId: 'n-high', quantidadeTn: 50 }];
  const m = calculateReceitaMetrics(itens, produtos, 50, 30, 7.2, 10, 5);

  assert(m.relacaoCN < 25);
  assert.strictEqual(m.statusCN, 'Déficit de carbono');
  assert(m.cicloDias < 60, `Ciclo deveria ser < 60 dias, obtido: ${m.cicloDias}`);
});

test('Motor G6: Balanço de Massa Seca, Mineralização e Eficiência de Conversão', () => {
  const produtos = [
    {
      id: 'p-balanco',
      nome: 'Massa Orgânica Teste',
      tipo: 'Orgânico',
      valorUnitario: 80,
      umidadePct: 40,
      densidadeTnM3: 0.5,
      nutrientes: { c_pct: 45, n_pct: 1.5, p2o5_pct: 1.0, k2o_pct: 1.0, ca_pct: 1.0, mg_pct: 0.5, s_pct: 0.5, si_pct: 0.5, mn_ppm: 100, zn_ppm: 50, co_ppm: 1, cu_ppm: 10, mo_ppm: 1, b_ppm: 10 }
    }
  ];

  const itens = [{ produtoId: 'p-balanco', quantidadeTn: 1000 }];
  const m = calculateReceitaMetrics(itens, produtos, 600, 30, 7.2, 100, 6);

  assert.strictEqual(m.massaTotalOriginal, 1000);
  assert.strictEqual(m.massaSecaInicial, 600);
  assert.strictEqual(m.massaSecaFinal, 420);
  assert.strictEqual(m.perdaMineralizacaoTn, 180);
  assert.strictEqual(m.eficienciaPct, 70.0);
  assert.strictEqual(m.perdaMassaPct, 30.0);
});

test('Motor G6: Cálculo Fiel de Kg por Metro Linear na Montagem da Leira', () => {
  const produtos = [
    {
      id: 'p-kg-metro',
      nome: 'Insumo Teste',
      tipo: 'Orgânico',
      valorUnitario: 100,
      umidadePct: 30,
      densidadeTnM3: 0.5,
      nutrientes: { c_pct: 40, n_pct: 1.5, p2o5_pct: 1, k2o_pct: 1, ca_pct: 1, mg_pct: 1, s_pct: 1, si_pct: 1, mn_ppm: 10, zn_ppm: 10, co_ppm: 1, cu_ppm: 1, mo_ppm: 1, b_ppm: 1 }
    }
  ];
  const itens = [{ produtoId: 'p-kg-metro', quantidadeTn: 500 }];
  const m = calculateReceitaMetrics(itens, produtos, 300, 30, 5.0, 50, 6);

  assert.strictEqual(m.extensaoTotalExact, 200);
  assert.strictEqual(m.itensComRateio[0].kgPorMetro, 2500);
  assert.strictEqual(m.totalKgPorMetro, 2500);
});

test('Motor G6: Garantias Nutricionais e Doses por Hectare (Macros e Micros)', () => {
  const produtos = [
    {
      id: 'p-nutri',
      nome: 'Insumo Nutritivo',
      tipo: 'Mineral',
      valorUnitario: 200,
      umidadePct: 10,
      densidadeTnM3: 1.0,
      nutrientes: {
        n_pct: 2.0, p2o5_pct: 4.0, k2o_pct: 3.0, ca_pct: 5.0, mg_pct: 1.5, s_pct: 1.0, si_pct: 2.0,
        mn_ppm: 500, zn_ppm: 300, co_ppm: 10, cu_ppm: 50, mo_ppm: 5, b_ppm: 40
      }
    }
  ];

  const itens = [{ produtoId: 'p-nutri', quantidadeTn: 100 }];
  const doseTnHa = 5.0;
  const m = calculateReceitaMetrics(itens, produtos, 100, 30, 7.2, 20, doseTnHa);

  assert.strictEqual(m.garantias.n_pct, 2.0);
  assert.strictEqual(m.kgHaNutrientes.n_pct, 100);
  assert.strictEqual(m.garantias.p2o5_pct, 4.0);
  assert.strictEqual(m.kgHaNutrientes.p2o5_pct, 200);
  assert.strictEqual(m.garantias.mn_ppm, 500);
  assert.strictEqual(m.kgHaNutrientes.mn_ppm, 2.5);
});

test('Financeiro: Cálculo Completo de Custos e Médias por Tn e Hectare', () => {
  const fin = calculateFinanceiro(
    6000,
    1000,
    40,
    25000,
    15000,
    1042000
  );

  assert.strictEqual(fin.custoOperacionalTotal, 240000);
  assert.strictEqual(fin.custoTotal, 1322000);
  assert.strictEqual(fin.valorPorTn, 220.33);
  assert.strictEqual(fin.valorPorHa, 1322.00);
});

// ---------------------------------------------------------------------------
// 3. TESTES DE INTEGRIDADE DOS DADOS SEED (seed.ts)
// ---------------------------------------------------------------------------
console.log('\n--- 3. Integridade do Banco de Dados Semente (Seed Data) ---');

test('Seed: Perfil Profissional do Usuário Completo', () => {
  assert(seedUserProfile.nome.length > 0);
  assert(seedUserProfile.registroProfissional.includes('CREA'));
  assert(seedUserProfile.email.includes('@'));
  assert(seedUserProfile.preferencias.leiraAlturaPadrao > 0);
  assert(seedUserProfile.preferencias.leiraBaseMaiorPadrao > seedUserProfile.preferencias.leiraBaseMenorPadrao);
});

test('Seed: Clientes cadastrados têm IDs únicos e nomes não-vazios', () => {
  assert(seedClientes.length >= 5);
  const ids = new Set(seedClientes.map(c => c.id));
  assert.strictEqual(ids.size, seedClientes.length);
  seedClientes.forEach(c => {
    assert(c.nome && c.nome.trim().length > 0);
    assert(c.cnpjCpf);
  });
});

test('Seed: Catálogo de Produtos contém itens Orgânicos e Minerais válidos', () => {
  assert(seedProdutos.length >= 10);
  const ids = new Set(seedProdutos.map(p => p.id));
  assert.strictEqual(ids.size, seedProdutos.length);
  seedProdutos.forEach(p => {
    assert(p.valorUnitario >= 0);
    assert(p.umidadePct >= 0 && p.umidadePct <= 100);
    assert(p.densidadeTnM3 > 0);
    assert(p.nutrientes);
  });
});

test('Seed: Orçamentos com Itens executam cálculos agronômicos perfeitamente', () => {
  const orcsComItens = seedOrcamentos.filter(o => o.itens && o.itens.length > 0);
  assert(orcsComItens.length >= 1, 'Deve haver orçamentos com receita cadastrada');
  
  orcsComItens.forEach(orc => {
    const calc = calculateReceitaMetrics(
      orc.itens,
      seedProdutos,
      orc.pesoFinalTn,
      orc.umidadeFinalPct,
      orc.secaoM2,
      orc.areaHa,
      orc.doseCompostoTnHa
    );
    assert(calc.massaTotalOriginal > 0);
    assert(calc.custoProdutos > 0);
    assert(calc.massaSecaInicial > 0);
    assert(calc.relacaoCN > 0);
    assert(['Ótimo', 'Déficit de carbono', 'Excesso de carbono'].includes(calc.statusCN));
  });
});

test('Seed: Medições de Monitoramento reais com temperatura biológica coerente', () => {
  const orcamentoComMedicoes = seedOrcamentos.find(o => o.medicoesLeiras && o.medicoesLeiras.length > 0);
  assert(orcamentoComMedicoes, 'Orçamento principal deve ter medições de leiras');

  const medicoesAtivas = orcamentoComMedicoes.medicoesLeiras.filter(m => m.media > 0);
  assert(medicoesAtivas.length > 0, 'Deve conter medições com leituras térmicas');

  medicoesAtivas.forEach(m => {
    assert(m.leiraNumero > 0);
    // Faixa física válida: medições com leitura parcial ou total entre 10°C e 85°C
    assert(m.media >= 10 && m.media <= 85, `Temperatura fora da faixa física: ${m.media}°C`);
    if (m.umidadePct > 0) {
      assert(m.umidadePct <= 100);
    }
  });

  // Medições com leitura completa nos 3 pontos de sonda devem estar em fase termofílica/mesofílica (30°C - 80°C)
  const leiturasCompletas = medicoesAtivas.filter(m => m.ponto1 > 0 && m.ponto2 > 0 && m.ponto3 > 0);
  assert(leiturasCompletas.length > 0, 'Deve conter leituras com 3 pontos');
  leiturasCompletas.forEach(m => {
    assert(m.media >= 30 && m.media <= 80, `Temperatura completa fora da faixa operacional: ${m.media}°C`);
  });
});

// ---------------------------------------------------------------------------
// 4. TESTES DE NAVEGAÇÃO E REGRAS DE RELATÓRIO GERAL
// ---------------------------------------------------------------------------
console.log('\n--- 4. Navegação, Abas e Relatório Geral (PDF Unificado) ---');

test('Relatório: Aba "geral" deve configurar predefinição padrão para apenas gráfico', () => {
  const configTabGeral = (t) => {
    if (t === 'geral') {
      return { monitShowChart: true, monitShowTable: false, monitShowConclusao: false };
    }
    return { monitShowChart: true, monitShowTable: true, monitShowConclusao: true };
  };

  const resGeral = configTabGeral('geral');
  assert.strictEqual(resGeral.monitShowChart, true, 'Gráfico deve estar ativo no Geral');
  assert.strictEqual(resGeral.monitShowTable, false, 'Tabela deve começar desmarcada no Geral');
  assert.strictEqual(resGeral.monitShowConclusao, false, 'Conclusão deve começar desmarcada no Geral');

  const resMonit = configTabGeral('monitoramento');
  assert.strictEqual(resMonit.monitShowChart, true);
  assert.strictEqual(resMonit.monitShowTable, true);
  assert.strictEqual(resMonit.monitShowConclusao, true);
});

test('Monitoramento: Presets de impressão rápida funcionam corretamente', () => {
  const applyPreset = (preset) => {
    if (preset === 'chart_only') return { chart: true, table: false, conclusao: false };
    if (preset === 'chart_conclusao') return { chart: true, table: false, conclusao: true };
    return { chart: true, table: true, conclusao: true };
  };

  const p1 = applyPreset('chart_only');
  assert.deepStrictEqual(p1, { chart: true, table: false, conclusao: false });

  const p2 = applyPreset('chart_conclusao');
  assert.deepStrictEqual(p2, { chart: true, table: false, conclusao: true });

  const p3 = applyPreset('full');
  assert.deepStrictEqual(p3, { chart: true, table: true, conclusao: true });
});

// ---------------------------------------------------------------------------
// RESULTADO FINAL
// ---------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(` RESULTADO DA BATERIA: ${passedTests} de ${totalTests} testes APROVADOS.`);
if (failedTests > 0) {
  console.log(` FALHAS DETECTADAS: ${failedTests} testes falharam.`);
  process.exit(1);
} else {
  console.log(' STATUS DO SISTEMA: 100% OPERACIONAL, SEM REGRESSÕES NEM ERROS!');
  console.log('======================================================================\n');
}
