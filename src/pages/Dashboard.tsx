import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* Header Superior */}
      <header className="top-header">
        <div className="header-content">
          <div className="header-left">
            <img 
              src="/Logo syp.png" 
              alt="Solutions & Payroll Logo" 
              className="header-logo"
            />
            <div className="header-text">
              <h1 className="company-name">Solutions & Payroll</h1>
              <p className="company-tagline">Soluciones tecnológicamente humanas</p>
            </div>
          </div>
          <div className="header-right">
            <p className="welcome-message">Bienvenido, Usuario Corporativo</p>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Sistema de Gestión de Proveedores</h1>
          <p className="dashboard-subtitle">
            Gestión integral de información, evaluación y seguimiento de proveedores
          </p>
        </div>

        <div className="dashboard-grid">
        {/* Formulario Base - Alta de Proveedores */}
        <Link to="/formulario-base" className="dashboard-card card-base">
          <div className="card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h3>Registro Proveedores</h3>
          <p>Registrar nuevos proveedores en el sistema</p>
        </Link>

        {/* Formulario 2 */}
        <Link to="/formulario-2" className="dashboard-card card-form2">
          <div className="card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3>Selección</h3>
          <p>Proceso de selección de proveedores</p>
        </Link>

        {/* Formulario 3 */}
        <Link to="/formulario-3" className="dashboard-card card-form3">
          <div className="card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <circle cx="12" cy="13" r="2" />
              <path d="M12 15v4" />
            </svg>
          </div>
          <h3>Seguimiento</h3>
          <p>Seguimiento de proveedores</p>
        </Link>

        {/* Formulario 4 */}
        <Link to="/formulario-4" className="dashboard-card card-form4">
          <div className="card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 15h6" />
              <path d="M12 12v6" />
            </svg>
          </div>
          <h3>Evaluación</h3>
          <p>Evaluación de proveedores</p>
        </Link>

        {/* Formulario 5 */}
        <Link to="/formulario-5" className="dashboard-card card-form5">
          <div className="card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 13h6" />
              <path d="M9 17h3" />
            </svg>
          </div>
          <h3>Reevaluación</h3>
          <p>Reevaluación de proveedores</p>
        </Link>
      </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer-main">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Solutions & Payroll</h3>
            <p>Expertos en gestión empresarial y soluciones de nómina</p>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>📧 automatizacion2@solutionsandpayroll.com</p>
            <p>📱 +57 300 123 4567</p>
          </div>
          <div className="footer-section">
            <h4>Información</h4>
            <p>Sistema de Gestión de Proveedores</p>
            <p>© 2026 Solutions & Payroll</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Todos los derechos reservados - Solutions & Payroll SAS</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
