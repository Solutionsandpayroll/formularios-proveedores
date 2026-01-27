import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Cliente, ApiResponse } from '../types';
import { powerAutomateService } from '../services/powerAutomateService';
import '../components/forms/FormularioBase.css';

interface SeguimientoFormData {
  cuatrimestre: string;
  nombreProveedor: string;
  identificacion: string;
  productoServicio: string;
  responsableSeguimiento: string;
  fechaSeleccion: string;
  fechaSeguimiento: string;
  cumplimientoEspecificaciones: string;
  oportunidadEntrega: string;
  calidadProducto: string;
  observaciones: string;
}

const Formulario3 = () => {
  const [cuatrimestreSeleccionado, setCuatrimestreSeleccionado] = useState<string>('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [seguidores, setSeguidores] = useState<string[]>([]);
  const [seguidorSeleccionado, setSeguidorSeleccionado] = useState<string>('');
  const [cargandoClientes, setCargandoClientes] = useState(false);

  // Función para convertir número de serie de Excel a fecha ISO (YYYY-MM-DD)
  const convertirFechaExcel = (fechaExcel: string | number | undefined): string => {
    if (!fechaExcel) return '';
    
    const numeroFecha = Number(fechaExcel);
    
    // Si ya es una fecha válida en formato YYYY-MM-DD, retornarla
    if (typeof fechaExcel === 'string' && fechaExcel.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return fechaExcel;
    }
    
    // Convertir número de serie de Excel a fecha JavaScript
    // Excel cuenta desde 1/1/1900, pero tiene un bug (considera 1900 bisiesto)
    // 25569 es la diferencia de días entre 1/1/1900 y 1/1/1970 (Unix epoch)
    if (!isNaN(numeroFecha) && numeroFecha > 0) {
      const fecha = new Date((numeroFecha - 25569) * 86400 * 1000);
      return fecha.toISOString().split('T')[0];
    }
    
    return '';
  };
  const [formData, setFormData] = useState<SeguimientoFormData>({
    cuatrimestre: '',
    nombreProveedor: '',
    identificacion: '',
    productoServicio: '',
    responsableSeguimiento: '',
    fechaSeleccion: '',
    fechaSeguimiento: '',
    cumplimientoEspecificaciones: '',
    oportunidadEntrega: '',
    calidadProducto: '',
    observaciones: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cuatrimestres = [
    { id: '1', nombre: 'Seguimiento primer cuatrimestre' },
    { id: '2', nombre: 'Seguimiento segundo cuatrimestre' },
    { id: '3', nombre: 'Seguimiento tercer cuatrimestre' },
  ];

  const seleccionarCuatrimestre = async (cuatrimestre: string) => {
    setCuatrimestreSeleccionado(cuatrimestre);
    setFormData({ ...formData, cuatrimestre });
    
    // Cargar clientes
    setCargandoClientes(true);
    try {
      const response: ApiResponse<Cliente[]> = await powerAutomateService.getClientes();
      if (response.success && response.data) {
        setClientes(response.data);
        
        // Extraer seguidores únicos de todas las columnas SEGUIMIENTO1-6
        const seguidoresSet = new Set<string>();
        response.data.forEach(cliente => {
          for (let i = 1; i <= 6; i++) {
            const seguidor = cliente[`SEGUIMIENTO${i}` as keyof Cliente];
            if (seguidor && typeof seguidor === 'string' && seguidor.trim()) {
              seguidoresSet.add(seguidor.trim());
            }
          }
        });
        
        setSeguidores(Array.from(seguidoresSet).sort());
      }
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setCargandoClientes(false);
    }
  };

  const handleSeguidorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const seguidor = e.target.value;
    setSeguidorSeleccionado(seguidor);
    
    // Actualizar el responsable en el formData
    setFormData(prev => ({ ...prev, responsableSeguimiento: seguidor }));
    
    if (seguidor) {
      // Filtrar proveedores que tienen este seguidor en alguna columna SEGUIMIENTO1-6
      const filtrados = clientes.filter(cliente => {
        for (let i = 1; i <= 6; i++) {
          const seguidorCliente = cliente[`SEGUIMIENTO${i}` as keyof Cliente];
          if (seguidorCliente && typeof seguidorCliente === 'string' && 
              seguidorCliente.trim() === seguidor) {
            return true;
          }
        }
        return false;
      });
      setClientesFiltrados(filtrados);
    } else {
      setClientesFiltrados([]);
      // Limpiar datos del proveedor si se deselecciona seguidor
      setFormData({
        ...formData,
        responsableSeguimiento: '',
        nombreProveedor: '',
        identificacion: '',
        productoServicio: '',
      });
    }
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = e.target.value;
    const clienteSeleccionado = clientesFiltrados.find(c => c.ItemInternalId === clienteId);
    
    console.log('Cliente seleccionado:', clienteSeleccionado);
    
    if (clienteSeleccionado) {
      setFormData({
        ...formData,
        nombreProveedor: clienteSeleccionado['NOMBRE DEL PROVEEDOR'] || '',
        identificacion: clienteSeleccionado['IDENTIFICACIÓN'] || '',
        productoServicio: clienteSeleccionado['PRODUCTO / SERVICIO QUE SUMINISTRA'] || '',
        fechaSeleccion: convertirFechaExcel(clienteSeleccionado['FECHA DE SELECCIÓN']),
      });
    } else if (!clienteId) {
      // Si se deselecciona, limpiar los campos
      setFormData({
        ...formData,
        nombreProveedor: '',
        identificacion: '',
        productoServicio: '',
        fechaSeleccion: '',
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.nombreProveedor.trim()) {
      setError('El nombre del proveedor es requerido');
      return false;
    }
    if (!formData.identificacion.trim()) {
      setError('La identificación es requerida');
      return false;
    }
    if (!formData.productoServicio.trim()) {
      setError('El producto/servicio es requerido');
      return false;
    }
    if (!formData.responsableSeguimiento.trim()) {
      setError('El responsable de seguimiento es requerido');
      return false;
    }
    if (!formData.fechaSeleccion) {
      setError('La fecha de selección es requerida');
      return false;
    }
    if (!formData.fechaSeguimiento) {
      setError('La fecha de seguimiento es requerida');
      return false;
    }
    if (!formData.cumplimientoEspecificaciones.trim()) {
      setError('El cumplimiento de especificaciones es requerido');
      return false;
    }
    if (!formData.oportunidadEntrega.trim()) {
      setError('La oportunidad en los tiempos de entrega es requerida');
      return false;
    }
    if (!formData.calidadProducto.trim()) {
      setError('La calidad del producto/servicio es requerida');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setEnviando(true);

    try {
      // Transformar cuatrimestre a trimestre para compatibilidad con Excel
      // Crear clave única para identificar la fila (Responsable_Proveedor_Año)
      const añoActual = new Date().getFullYear();
      const dataParaEnviar: any = {
        ...formData,
        trimestre: formData.cuatrimestre,
        claveSeguimiento: `${formData.responsableSeguimiento}_${formData.nombreProveedor}_${añoActual}`
      };
      
      const response = await powerAutomateService.submitFormulario3(dataParaEnviar);

      if (response.success) {
        setRegistroExitoso(true);
      } else {
        setError(response.error || 'Error al enviar el formulario');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al conectar con el servidor. Por favor, intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const registrarOtro = () => {
    setRegistroExitoso(false);
    setCuatrimestreSeleccionado('');
    setFormData({
      cuatrimestre: '',
      nombreProveedor: '',
      identificacion: '',
      productoServicio: '',
      responsableSeguimiento: '',
      fechaSeleccion: '',
      fechaSeguimiento: '',
      cumplimientoEspecificaciones: '',
      oportunidadEntrega: '',
      calidadProducto: '',
      observaciones: '',
    });
  };

  if (registroExitoso) {
    return (
      <div className="success-screen">
        <div className="success-content">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className="success-title">¡Seguimiento Registrado Exitosamente!</h1>
          <p className="success-message">
            Los datos del seguimiento han sido guardados correctamente.
            <br />
            Los datos se han guardado en Excel.
          </p>
          
          <div className="success-actions">
            <button 
              className="btn btn-primary btn-lg"
              onClick={registrarOtro}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Registrar Otro Seguimiento
            </button>
            <Link to="/" className="btn btn-outline btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              Volver al Menú Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cuatrimestreSeleccionado) {
    return (
      <div className="form-container">
        <div className="form-header">
          <button className="btn-back" onClick={() => window.location.href = '/'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
          <h1>Seguimiento de Proveedores</h1>
          <p className="form-description">Seleccione el cuatrimestre para realizar el seguimiento</p>
        </div>

        <div className="cuatrimestre-selection">
          {cuatrimestres.map((cuatrimestre) => (
            <button
              key={cuatrimestre.id}
              onClick={() => seleccionarCuatrimestre(cuatrimestre.id)}
              className="cuatrimestre-card"
            >
              <h3>{cuatrimestre.nombre}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se cargan los clientes
  if (cargandoClientes) {
    return (
      <div className="form-container">
        <div className="form-header">
          <button className="btn-back" onClick={() => setCuatrimestreSeleccionado('')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
          <h1>Seguimiento - {cuatrimestres.find(t => t.id === cuatrimestreSeleccionado)?.nombre}</h1>
          <p className="form-description">Cargando información...</p>
        </div>

        <div className="form-content" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '400px',
          gap: '1.5rem'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="12" cy="12" r="10" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
          </svg>
          <p style={{ color: '#64748b', fontSize: '1.125rem', fontWeight: '500' }}>
            Cargando proveedores disponibles...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="btn-back" onClick={() => setCuatrimestreSeleccionado('')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        <h1>Seguimiento - {cuatrimestres.find(t => t.id === cuatrimestreSeleccionado)?.nombre}</h1>
        <p className="form-description">Complete la información del seguimiento del proveedor</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-section">
          <h2>Responsable de Seguimiento</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="responsableSeguimiento">Responsable de seguimiento *</label>
              <select
                id="responsableSeguimiento"
                name="responsableSeguimiento"
                value={seguidorSeleccionado}
                onChange={handleSeguidorChange}
                className="form-input"
                required
              >
                <option value="">
                  Seleccione el responsable
                </option>
                {seguidores.map((seguidor) => (
                  <option key={seguidor} value={seguidor}>
                    {seguidor}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fechaSeguimiento">Fecha de Seguimiento *</label>
              <input
                type="date"
                id="fechaSeguimiento"
                name="fechaSeguimiento"
                value={formData.fechaSeguimiento}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Información del Proveedor</h2>
          
          <div className="form-group">
            <label htmlFor="cliente">Seleccionar Proveedor</label>
            <select
              id="cliente"
              onChange={handleClienteChange}
              className="form-input"
              disabled={!seguidorSeleccionado}
              >
                <option value="">
                  {!seguidorSeleccionado 
                    ? 'Primero seleccione el responsable' 
                    : clientesFiltrados.length === 0 
                      ? 'No hay proveedores asignados' 
                      : 'Seleccione un proveedor'}
                </option>
                {clientesFiltrados.map((cliente) => (
                  <option key={cliente.ItemInternalId} value={cliente.ItemInternalId}>
                    {cliente['NOMBRE DEL PROVEEDOR']}
                  </option>
                ))}
              </select>
          </div>

          <div className="form-group">
            <label htmlFor="fechaSeleccion">Fecha de Selección *</label>
            <input
              type="date"
              id="fechaSeleccion"
              name="fechaSeleccion"
              value={formData.fechaSeleccion}
              onChange={handleInputChange}
              className="form-input"
              readOnly
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombreProveedor">Nombre *</label>
              <input
                type="text"
                id="nombreProveedor"
                name="nombreProveedor"
                value={formData.nombreProveedor}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="identificacion">Identificación *</label>
              <input
                type="text"
                id="identificacion"
                name="identificacion"
                value={formData.identificacion}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="productoServicio">Producto / Servicio que suministra *</label>
            <input
              type="text"
              id="productoServicio"
              name="productoServicio"
              value={formData.productoServicio}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Evaluación de Desempeño</h2>
          
          <div className="form-group">
            <label htmlFor="cumplimientoEspecificaciones">
              Cumplimiento especificaciones contractuales o negociación inicial (30%) *
            </label>
            <select
              id="cumplimientoEspecificaciones"
              name="cumplimientoEspecificaciones"
              value={formData.cumplimientoEspecificaciones}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="Cumple">Cumple</option>
              <option value="Cumple Parcialmente">Cumple Parcialmente</option>
              <option value="No cumple">No cumple</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="oportunidadEntrega">
              Oportunidad en los tiempos de entrega (35%) *
            </label>
            <select
              id="oportunidadEntrega"
              name="oportunidadEntrega"
              value={formData.oportunidadEntrega}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="Cumple">Cumple</option>
              <option value="Cumple Parcialmente">Cumple Parcialmente</option>
              <option value="No cumple">No cumple</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="calidadProducto">
              Calidad del producto/servicio en uso (35%) *
            </label>
            <select
              id="calidadProducto"
              name="calidadProducto"
              value={formData.calidadProducto}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="Mala Calidad">Mala Calidad</option>
              <option value="Calidad regular">Calidad regular</option>
              <option value="Excelente Calidad">Excelente Calidad</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Observaciones</h2>
          
          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              className="form-input"
              rows={4}
              placeholder="Ingrese observaciones adicionales sobre el seguimiento..."
            />
          </div>
        </div>

        <div className="form-actions">
          <Link to="/" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar Seguimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Formulario3;
