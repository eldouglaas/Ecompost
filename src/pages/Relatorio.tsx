import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { brl, num, useStore } from '../store/store';
import { ComposicaoNutricional } from '../types';

const macro: [keyof ComposicaoNutricional, string][] = [
  ['n_pct', 'N (%)'], ['p2o5_pct', 'P2O5 (%)'], ['k2o_pct', 'K2O (%)'], ['ca_pct', 'Ca (%)'],
  ['mg_pct', 'Mg (%)'], ['s_pct', 'S (%)'], ['si_pct', 'Si (%)'],
];
const micro: [keyof ComposicaoNutricional, string][] = [
  ['mn_ppm', 'Mn (ppm)'], ['zn_ppm', 'Zn (ppm)'], ['co_ppm', 'Co (ppm)'],
  ['cu_ppm', 'Cu (ppm)'], ['mo_ppm', 'Mo (ppm)'], ['b_ppm', 'B (ppm)'],
];

function Section({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-3 border-l-4 border-emerald-600 pl-2 text-xs font-bold uppercase tracking-wider">{t}</h3>
      {children}
    </section>
  );
}
const Box = ({ l, v }: { l: string; v: string }) => (
  <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-subtle)' }}>
    <div className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>{l}</div>
    <div className="font-bold">{v}</div>
  </div>
);

export default function Relatorio() {
  const { id } = useParams();
  const nav = useNavigate();
  const { orcamentos, produtos } = useStore();
  const o = orcamentos.find((x) => x.id === id);
  if (!o) return <div>Orçamento não encontrado. <Link to="/orcamentos" className="text-emerald-600">Voltar</Link></div>;

  // Concentração por tonelada de composto = Σ(qtd × teor) / Σ(qtd)
  const totalQtd = o.itens.reduce((s, i) => s + i.quantidadeTn, 0) || 1;
  const conc = (k: keyof ComposicaoNutricional) =>
    o.itens.reduce((s, i) => s + i.quantidadeTn * (produtos.find((p) => p.id === i.produtoId)?.nutrientes[k] || 0), 0) / totalQtd;
  // kg/ha: (conc% /100 × 1000 kg/tn) × dose tn/ha ; ppm: conc × dose /1000
  const kgHa = (k: keyof ComposicaoNutricional) =>
    String(k).endsWith('_ppm') ? (conc(k) * o.doseCompostoTnHa) / 1000 : conc(k) * 10 * o.doseCompostoTnHa;

  return (
    <div>
      <div className="no-print mb-4 flex items-center gap-3">
        <button onClick={() => nav('/orcamentos')}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-xl font-bold">Projeto de Compostagem Final <span className="font-normal" style={{ color: 'var(--text-muted)' }}>· {o.clienteNome}</span></h1>
        <button className="btn-primary ml-auto" onClick={() => window.print()}><Printer className="h-4 w-4" /> Baixar PDF / Imprimir</button>
      </div>

      <div className="card print-page p-8">
        <div className="mb-6 flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-card)' }}>
          <div><div className="text-2xl font-bold">Ecompost</div><div className="text-xs tracking-widest text-emerald-600">ECOLOGICAMENTE LUCRATIVO</div></div>
          <div className="text-right"><div className="font-bold">Projeto de Compostagem Final</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Orçamento #{o.numero} · Emissão {new Date().toLocaleDateString('pt-BR')}</div></div>
        </div>

        <Section t="Identificação">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <Box l="Cliente" v={o.clienteNome} /><Box l="Propriedade" v={o.propriedade || '—'} />
            <Box l="Consultor" v={o.consultor || '—'} /><Box l="Data" v={new Date(o.data).toLocaleDateString('pt-BR')} />
            <div className="col-span-4"><Box l="Descrição" v={o.descricao || '—'} /></div>
          </div>
        </Section>

        <Section t="Parâmetros técnicos">
          <div className="grid grid-cols-4 gap-3 text-sm">
            <Box l="Dose (tn/ha)" v={num(o.doseCompostoTnHa, 3)} /><Box l="Área (ha)" v={num(o.areaHa)} />
            <Box l="Umidade final (%)" v={String(o.umidadeFinalPct)} /><Box l="Peso final (tn)" v={num(o.pesoFinalTn)} />
          </div>
        </Section>

        <Section t="Dimensionamento das leiras · seção trapezoidal">
          <div className="grid grid-cols-7 gap-3 text-sm">
            <Box l="Altura (m)" v={num(o.leiraAlturaM)} /><Box l="Base menor (m)" v={num(o.leiraBaseMenorM)} />
            <Box l="Base maior (m)" v={num(o.leiraBaseMaiorM)} /><Box l="Ext./leira (m)" v={num(o.leiraExtensaoM)} />
            <Box l="Seção (m²)" v={num(o.secaoM2)} /><Box l="Ext. total (m)" v={num(o.extensaoTotalM, 0)} />
            <Box l="Nr. leiras" v={num(o.nrLeiras, 1)} />
          </div>
        </Section>

        <Section t="Resumo financeiro">
          <div className="grid grid-cols-4 gap-3 text-sm">
            <Box l="Operacional (R$/tn)" v={brl(o.custoOperacionalPorTn)} /><Box l="Assessoria" v={brl(o.assessoriaTotal)} />
            <Box l="Locação equip." v={brl(o.locacaoEquipamentos)} /><Box l="Produtos" v={brl(o.custoProdutos)} />
            <Box l="Valor / tn" v={brl(o.valorPorTn)} /><Box l="Valor / ha" v={brl(o.valorPorHa)} />
          </div>
          <div className="mt-3 flex justify-between rounded-xl bg-emerald-700 px-5 py-3 text-white"><span className="font-semibold">TOTAL DO PROJETO</span><b className="text-xl">{brl(o.custoTotal)}</b></div>
        </Section>

        <Section t="Produtos do composto">
          <table className="data-table">
            <thead><tr><th>Produto</th><th>Tipo</th><th className="text-right">% custo</th><th className="text-right">Valor/tn</th><th className="text-right">Total</th><th className="text-right">Mat. seca</th><th className="text-right">Mat. orig.</th><th className="text-right">Custo/ha</th></tr></thead>
            <tbody>
              {o.itens.map((i) => (
                <tr key={i.id}><td className="font-semibold">{i.produtoNome}</td><td>{i.tipo}</td><td className="text-right">{num(i.percentual)}</td><td className="text-right">{brl(i.valorUnitario)}</td><td className="text-right font-semibold">{brl(i.subtotal)}</td><td className="text-right">{num(i.massaSecaTn)}</td><td className="text-right">{num(i.quantidadeTn)}</td><td className="text-right">{brl(o.areaHa ? i.subtotal / o.areaHa : 0)}</td></tr>
              ))}
              <tr className="font-bold"><td>Totais</td><td /><td className="text-right">100,00</td><td /><td className="text-right">{brl(o.custoProdutos)}</td><td className="text-right">{num(o.massaSecaInicialTn)}</td><td className="text-right">{num(totalQtd)}</td><td /></tr>
            </tbody>
          </table>
        </Section>

        <Section t="Garantia nutricional por tonelada">
          <div className="mb-3 grid grid-cols-7 gap-3 text-sm">{macro.map(([k, l]) => <Box key={k} l={l} v={num(conc(k))} />)}</div>
          <div className="grid grid-cols-6 gap-3 text-sm">{micro.map(([k, l]) => <Box key={k} l={l} v={num(conc(k))} />)}</div>
        </Section>

        <Section t="Quilogramas de nutrientes por hectare (kg/ha)">
          <div className="mb-3 grid grid-cols-7 gap-3 text-sm">{macro.map(([k, l]) => <Box key={k} l={l.split(' ')[0]} v={num(kgHa(k))} />)}</div>
          <div className="grid grid-cols-6 gap-3 text-sm">{micro.map(([k, l]) => <Box key={k} l={l.split(' ')[0]} v={num(kgHa(k))} />)}</div>
        </Section>

        <div className="flex justify-between border-t pt-3 text-xs" style={{ borderColor: 'var(--border-card)', color: 'var(--text-muted)' }}>
          <span className="text-emerald-600">Ecompost — Ecologicamente Lucrativo</span><span>Documento técnico gerado automaticamente</span>
        </div>
      </div>
    </div>
  );
}
