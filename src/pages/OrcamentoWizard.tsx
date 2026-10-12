import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Plus, Thermometer, Trash2 } from 'lucide-react';
import { Field, Input, Select } from '../components/ui';
import { brl, num, uid, useStore } from '../store/store';
import { ItemReceitaComposto, Orcamento } from '../types';
import {
  calculateAreaSecaoLeira, calculateExtensaoTotalLeiras, calculateFinanceiro,
  calculateNrLeiras, calculateReceitaMetrics,
} from '../utils/agronomyCalculations';

const steps = ['Dados do Cliente', 'Tamanho e Dose', 'Receita do Composto', 'Custos', 'Conferir Tudo'];

const blank = (numero: number): Orcamento => ({
  id: uid(), numero, data: new Date().toISOString().slice(0, 10), clienteId: '', clienteNome: '',
  consultor: '', propriedade: '', descricao: '',
  umidadeFinalPct: 30, doseCompostoTnHa: 6, areaHa: 100, pesoFinalTn: 600,
  leiraAlturaM: 1.8, leiraBaseMenorM: 2, leiraBaseMaiorM: 6, leiraExtensaoM: 120,
  secaoM2: 7.2, extensaoTotalM: 0, nrLeiras: 0,
  itens: [], relacaoCN: 0, carbonoTotalTn: 0, nitrogenioTotalTn: 0, densidadeMedia: 0.72,
  massaSecaInicialTn: 0, massaSecaFinalTn: 0, massaSugeridaMetaTn: 0, eficienciaPct: 0,
  perdaMineralizacaoTn: 0, cicloDias: 56,
  custoOperacionalPorTn: 40, assessoriaTotal: 0, locacaoEquipamentos: 0, custoProdutos: 0,
  custoTotal: 0, valorPorTn: 0, valorPorHa: 0, situacao: 'Aberto',
});

export default function OrcamentoWizard() {
  const { id } = useParams();
  const nav = useNavigate();
  const { clientes, produtos, orcamentos, saveOrcamento, nextOrcamentoNumero } = useStore();
  const [step, setStep] = useState(0);
  const [o, setO] = useState<Orcamento>(() => orcamentos.find((x) => x.id === id) ?? blank(nextOrcamentoNumero()));

  // Derived values
  const d = useMemo(() => {
    const peso = +(o.doseCompostoTnHa * o.areaHa).toFixed(2);
    const secao = calculateAreaSecaoLeira(o.leiraBaseMaiorM, o.leiraBaseMenorM, o.leiraAlturaM);
    const m = calculateReceitaMetrics(o.itens, produtos, peso);
    const extTotal = calculateExtensaoTotalLeiras(m.volumeTotalM3, secao);
    const nr = calculateNrLeiras(extTotal, o.leiraExtensaoM);
    const f = calculateFinanceiro(peso, o.areaHa, o.custoOperacionalPorTn, o.assessoriaTotal, o.locacaoEquipamentos, m.custoProdutos);
    return { peso, secao, m, extTotal, nr, f };
  }, [o, produtos]);

  const set = <K extends keyof Orcamento>(k: K, v: Orcamento[K]) => setO((p) => ({ ...p, [k]: v }));

  const updateItem = (itemId: string, patch: Partial<ItemReceitaComposto>) =>
    setO((p) => ({
      ...p,
      itens: p.itens.map((it) => {
        if (it.id !== itemId) return it;
        const n = { ...it, ...patch };
        if (patch.produtoId) {
          const pr = produtos.find((x) => x.id === patch.produtoId)!;
          Object.assign(n, { produtoNome: pr.nome, tipo: pr.tipo, umidadePct: pr.umidadePct, valorUnitario: pr.valorUnitario });
        }
        n.massaSecaTn = +(n.quantidadeTn * (1 - n.umidadePct / 100)).toFixed(2);
        n.subtotal = +(n.quantidadeTn * n.valorUnitario).toFixed(2);
        return n;
      }),
    }));

  const addItem = () => {
    const pr = produtos[0];
    if (!pr) return;
    setO((p) => ({
      ...p,
      itens: [...p.itens, {
        id: uid(), produtoId: pr.id, produtoNome: pr.nome, tipo: pr.tipo, quantidadeTn: 100,
        umidadePct: pr.umidadePct, massaSecaTn: +(100 * (1 - pr.umidadePct / 100)).toFixed(2),
        percentual: 0, valorUnitario: pr.valorUnitario, subtotal: +(100 * pr.valorUnitario).toFixed(2),
      }],
    }));
  };

  const totalCusto = d.m.custoProdutos;
  const canNext = step === 0 ? !!o.clienteId : step === 2 ? o.itens.length > 0 : true;

  const save = () => {
    const itens = o.itens.map((it) => ({ ...it, percentual: totalCusto > 0 ? +((it.subtotal / totalCusto) * 100).toFixed(2) : 0 }));
    saveOrcamento({
      ...o, itens, pesoFinalTn: d.peso, secaoM2: d.secao, extensaoTotalM: d.extTotal, nrLeiras: d.nr,
      relacaoCN: d.m.relacaoCN, carbonoTotalTn: d.m.carbonoTotal, nitrogenioTotalTn: d.m.nitrogenioTotal,
      densidadeMedia: d.m.densidadeMedia, massaSecaInicialTn: d.m.massaSecaInicial,
      massaSecaFinalTn: d.m.massaSecaFinal, massaSugeridaMetaTn: d.m.massaSugeridaMeta,
      eficienciaPct: d.m.eficienciaPct, perdaMineralizacaoTn: d.m.perdaMineralizacaoTn, cicloDias: d.m.cicloDias,
      custoProdutos: d.m.custoProdutos, custoTotal: d.f.custoTotal, valorPorTn: d.f.valorPorTn, valorPorHa: d.f.valorPorHa,
    });
    nav(`/orcamentos/${o.id}/relatorio`);
  };

  const cn = d.m.relacaoCN;
  const cnMsg = cn < 25 ? 'Déficit de carbono — adicione material rico em C (palha, serragem)' : cn > 30 ? 'Excesso de carbono — adicione material rico em N (esterco, cama de frango)' : 'Relação C:N na faixa ideal';
  const cnOk = cn >= 25 && cn <= 30;
  const ro = { background: 'var(--bg-card-subtle)' };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => nav('/orcamentos')}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-2xl font-bold">{id ? 'Editar Orçamento' : 'Novo Orçamento'}</h1>
        {o.clienteNome && <span style={{ color: 'var(--text-muted)' }}>· {o.clienteNome}</span>}
        {id && <button className="btn-secondary ml-auto" onClick={() => nav(`/orcamentos/${o.id}/monitoramento`)}><Thermometer className="h-4 w-4" /> Monitoramento de Leira</button>}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <button key={s} onClick={() => (i <= step || canNext) && setStep(i)}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            style={{ background: i === step ? '#2f7d46' : i < step ? 'var(--primary-light)' : 'transparent', color: i === step ? '#fff' : i < step ? 'var(--primary-text)' : 'var(--text-muted)' }}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-xs">{i < step ? <Check className="h-3 w-3" /> : i + 1}</span>{s}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3"><h2 className="text-lg font-bold">Dados do Cliente</h2><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Conte quem é o cliente e a propriedade onde vai ser feita a compostagem.</p></div>
            <Field label="Cliente *">
              <Select value={o.clienteId} onChange={(e) => setO({ ...o, clienteId: e.target.value, clienteNome: clientes.find((c) => c.id === e.target.value)?.nome || '' })}>
                <option value="">- Selecione</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </Field>
            <Field label="Data"><Input type="date" value={o.data} onChange={(e) => set('data', e.target.value)} /></Field>
            <Field label="Consultor"><Input value={o.consultor} onChange={(e) => set('consultor', e.target.value)} /></Field>
            <Field label="Propriedade"><Input value={o.propriedade} onChange={(e) => set('propriedade', e.target.value)} /></Field>
            <div className="md:col-span-2"><Field label="Descrição"><Input value={o.descricao} onChange={(e) => set('descricao', e.target.value)} /></Field></div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Tamanho da Área e Dose</h2>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Quantos hectares vai receber o composto e quanto vai por hectare.</p>
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Umidade Final (%)"><Select value={o.umidadeFinalPct} onChange={(e) => set('umidadeFinalPct', +e.target.value)}>{[20, 25, 30, 35, 40, 45, 50].map((v) => <option key={v} value={v}>{v}%</option>)}</Select></Field>
                <Field label="Dose Composto (tn/ha)"><Input type="number" step="any" value={o.doseCompostoTnHa} onChange={(e) => set('doseCompostoTnHa', +e.target.value)} /></Field>
                <Field label="Área (ha)"><Input type="number" step="any" value={o.areaHa} onChange={(e) => set('areaHa', +e.target.value)} /></Field>
                <Field label="Peso Final (tn)"><Input disabled style={ro} value={num(d.peso)} readOnly /></Field>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">Tamanho das Leiras</h2>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Como vai ser a leira no campo — altura e largura da base.</p>
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Altura (m)"><Input type="number" step="any" value={o.leiraAlturaM} onChange={(e) => set('leiraAlturaM', +e.target.value)} /></Field>
                <Field label="Base Menor (m)"><Input type="number" step="any" value={o.leiraBaseMenorM} onChange={(e) => set('leiraBaseMenorM', +e.target.value)} /></Field>
                <Field label="Base Maior (m)"><Input type="number" step="any" value={o.leiraBaseMaiorM} onChange={(e) => set('leiraBaseMaiorM', +e.target.value)} /></Field>
                <Field label="Extensão por Leira (m)"><Input type="number" step="any" value={o.leiraExtensaoM} onChange={(e) => set('leiraExtensaoM', +e.target.value)} /></Field>
                <Field label="Seção (m²)"><Input disabled value={num(d.secao)} readOnly /></Field>
                <Field label="Extensão Total (m)"><Input disabled value={num(d.extTotal, 0)} readOnly /></Field>
                <Field label="Nr. Leiras"><Input disabled value={num(d.nr, 1)} readOnly /></Field>
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Extensão total e nº de leiras são calculados após montar a receita (etapa 3).</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-lg font-bold">Receita do Composto</h2><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Escolha os insumos e as quantidades (tn).</p></div>
              <button className="btn-primary" onClick={addItem}><Plus className="h-4 w-4" /> Adicionar insumo</button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Produto</th><th>Tipo</th><th className="text-right">Qtd (tn)</th><th className="text-right">Mat. seca</th><th className="text-right">% custo</th><th className="text-right">Valor/tn</th><th className="text-right">Total</th><th /></tr></thead>
                <tbody>
                  {o.itens.map((it) => (
                    <tr key={it.id}>
                      <td style={{ minWidth: 220 }}><Select value={it.produtoId} onChange={(e) => updateItem(it.id, { produtoId: e.target.value })}>{produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</Select></td>
                      <td>{it.tipo}</td>
                      <td style={{ width: 120 }}><Input type="number" step="any" className="text-right" value={it.quantidadeTn} onChange={(e) => updateItem(it.id, { quantidadeTn: +e.target.value })} /></td>
                      <td className="text-right">{num(it.massaSecaTn)}</td>
                      <td className="text-right font-semibold" style={{ color: '#16a34a' }}>{totalCusto > 0 ? num((it.subtotal / totalCusto) * 100) : '0,00'}%</td>
                      <td className="text-right">{brl(it.valorUnitario)}</td>
                      <td className="text-right font-bold">{brl(it.subtotal)}</td>
                      <td><button onClick={() => setO({ ...o, itens: o.itens.filter((x) => x.id !== it.id) })}><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                  {o.itens.length === 0 && <tr><td colSpan={8} className="text-center" style={{ color: 'var(--text-muted)' }}>Adicione ao menos um insumo.</td></tr>}
                  <tr><td className="font-bold">Totais</td><td /><td className="text-right font-bold">{num(d.m.massaTotalOriginal)}</td><td className="text-right font-bold">{num(d.m.massaSecaInicial)}</td><td /><td /><td className="text-right font-bold">{brl(totalCusto)}</td><td /></tr>
                </tbody>
              </table>
            </div>

            {o.itens.length > 0 && (<>
              <h3 className="font-bold">Engenharia do Composto <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>— visão do agrônomo</span></h3>
              <div className="rounded-2xl border p-5" style={{ background: cnOk ? 'var(--primary-light)' : '#fdf6ec', borderColor: 'var(--border-card)' }}>
                <div className="flex justify-between">
                  <div><div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Relação Carbono:Nitrogênio</div><div className="text-4xl font-bold">{num(cn, 1)}<span className="text-base font-normal text-slate-400"> :1</span></div></div>
                  <div className="text-right"><div className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>Faixa ideal</div><div className="font-bold">25–30 : 1</div></div>
                </div>
                <p className={`mt-3 flex items-center gap-2 text-sm font-medium ${cnOk ? 'text-emerald-700' : 'text-amber-700'}`}>{!cnOk && <AlertTriangle className="h-4 w-4" />}{cnMsg}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[['Carbono total', num(d.m.carbonoTotal), 'tn C'], ['Nitrogênio total', num(d.m.nitrogenioTotal), 'tn N'], ['Densidade média', num(d.m.densidadeMedia), 'tn/m³'], ['Massa seca inicial', num(d.m.massaSecaInicial), 'tn']].map(([l, v, u]) => (
                  <div key={l} className="rounded-xl border p-4" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-subtle)' }}>
                    <div className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{l}</div><div className="text-xl font-bold">{v} <span className="text-sm font-normal">{u}</span></div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-card)' }}>
                <div className="mb-3 font-semibold">Balanço de Massa — Mineralização</div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[['Massa seca final', num(d.m.massaSecaFinal) + ' tn'], ['Sugerida p/ meta', num(d.m.massaSugeridaMeta) + ' tn'], ['Eficiência', d.m.eficienciaPct + ' %'], ['Perda por mineralização', num(d.m.perdaMineralizacaoTn) + ' tn']].map(([l, v]) => (
                    <div key={l} className="rounded-lg p-3" style={{ background: 'var(--bg-card-subtle)' }}><div className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{l}</div><div className="text-lg font-bold">{v}</div></div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-card)' }}>
                <div className="mb-2 flex justify-between font-semibold"><span>Ciclo de Compostagem</span><span>{d.m.cicloDias} dias</span></div>
                <div className="flex h-3 overflow-hidden rounded-full"><div style={{ width: '7%', background: '#6b9bf0' }} /><div style={{ width: '38%', background: '#e7a13a' }} /><div style={{ width: '55%', background: '#4cb084' }} /></div>
                <div className="mt-2 flex justify-between text-xs"><span>● Mesófilo · 4d (20–45 °C)</span><span>● Termófilo · 21d (45–70 °C)</span><span>● Maturação · 31d</span></div>
              </div>
            </>)}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold">Custos do Projeto</h2>
            <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Quanto custa a mão de obra, a assessoria e os equipamentos.</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Custo Operacional (R$/tn)"><Input type="number" step="any" value={o.custoOperacionalPorTn} onChange={(e) => set('custoOperacionalPorTn', +e.target.value)} /></Field>
              <Field label="Assessoria (R$)"><Input type="number" step="any" value={o.assessoriaTotal} onChange={(e) => set('assessoriaTotal', +e.target.value)} /></Field>
              <Field label="Locação Equipamentos (R$)"><Input type="number" step="any" value={o.locacaoEquipamentos} onChange={(e) => set('locacaoEquipamentos', +e.target.value)} /></Field>
              <Field label="Custo Produtos (R$)"><Input disabled value={brl(d.m.custoProdutos)} readOnly /></Field>
              <Field label="Custo Total (R$)"><Input disabled value={brl(d.f.custoTotal)} readOnly /></Field>
              <Field label="Situação"><Select value={o.situacao} onChange={(e) => set('situacao', e.target.value as Orcamento['situacao'])}><option>Aberto</option><option>Aprovado</option><option>Cancelado</option></Select></Field>
              <div className="md:col-span-1"><Field label="Valor / TN"><Input disabled value={brl(d.f.valorPorTn)} readOnly /></Field></div>
              <div className="md:col-span-2"><Field label="Valor / HA"><Input disabled value={brl(d.f.valorPorHa)} readOnly /></Field></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Conferir Tudo Antes de Salvar</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Veja se está tudo certo. Depois é só salvar o projeto.</p>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Cliente"><Input disabled value={o.clienteNome} readOnly /></Field>
              <Field label="Área (ha)"><Input disabled value={num(o.areaHa)} readOnly /></Field>
              <Field label="Dose (tn/ha)"><Input disabled value={num(o.doseCompostoTnHa, 3)} readOnly /></Field>
              <Field label="Peso Final (tn)"><Input disabled value={num(d.peso)} readOnly /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card p-4 text-center">
                <div className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>Relação C:N</div>
                <div className="text-5xl font-bold" style={{ color: cnOk ? '#16a34a' : '#d97706' }}>{Math.round(cn)}</div>
                <div className="text-xs">faixa ideal 25–30</div>
              </div>
              <div className="card p-4">
                <div className="mb-2 text-xs uppercase" style={{ color: 'var(--text-muted)' }}>Proporção dos ingredientes (custo)</div>
                {o.itens.map((it) => (
                  <div key={it.id} className="mb-1.5">
                    <div className="flex justify-between text-xs"><span>{it.produtoNome}</span><span>{totalCusto > 0 ? num((it.subtotal / totalCusto) * 100, 1) : 0}%</span></div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--bg-card-subtle)' }}><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${totalCusto > 0 ? (it.subtotal / totalCusto) * 100 : 0}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-emerald-700 p-4 text-right text-white">Total do projeto: <b className="text-2xl">{brl(d.f.custoTotal)}</b></div>
          </div>
        )}

        <div className="mt-6 flex justify-between border-t pt-4" style={{ borderColor: 'var(--border-card)' }}>
          <button className="btn-secondary" onClick={() => (step === 0 ? nav('/orcamentos') : setStep(step - 1))}>
            <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Cancelar' : 'Voltar'}
          </button>
          {step < 4 ? (
            <button className="btn-primary disabled:opacity-50" disabled={!canNext} onClick={() => setStep(step + 1)}>Avançar <ArrowRight className="h-4 w-4" /></button>
          ) : (
            <button className="btn-primary" onClick={save}><Check className="h-4 w-4" /> Salvar projeto</button>
          )}
        </div>
      </div>
    </div>
  );
}
