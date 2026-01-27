import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FormularioBase from './components/forms/FormularioBase';
import Formulario1 from './pages/Formulario1';
import Formulario2 from './pages/Formulario2';
import Formulario3 from './pages/Formulario3';
import Formulario4 from './pages/Formulario4';
import Formulario5 from './pages/Formulario5';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/formulario-base" element={<FormularioBase />} />
          <Route path="/formulario-1" element={<Formulario1 />} />
          <Route path="/formulario-2" element={<Formulario2 />} />
          <Route path="/formulario-3" element={<Formulario3 />} />
          <Route path="/formulario-4" element={<Formulario4 />} />
          <Route path="/formulario-5" element={<Formulario5 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
