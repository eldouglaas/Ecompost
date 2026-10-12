import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import Orcamentos from './pages/Orcamentos';
import OrcamentoWizard from './pages/OrcamentoWizard';
import Relatorio from './pages/Relatorio';
import Monitoramento from './pages/Monitoramento';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/orcamentos" element={<Orcamentos />} />
        <Route path="/orcamentos/novo" element={<OrcamentoWizard />} />
        <Route path="/orcamentos/:id/editar" element={<OrcamentoWizard />} />
        <Route path="/orcamentos/:id/relatorio" element={<Relatorio />} />
        <Route path="/orcamentos/:id/monitoramento" element={<Monitoramento />} />
      </Routes>
    </Layout>
  );
}
