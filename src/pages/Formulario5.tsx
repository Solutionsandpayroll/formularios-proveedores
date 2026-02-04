import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Cliente, ApiResponse } from '../types';
import { powerAutomateService } from '../services/powerAutomateService';
import '../components/forms/FormularioBase.css';

interface ReevaluacionFormData {
  nombreProveedor: string;
  identificacion: string;
  productoServicio: string;
  responsableReevaluacion: string;
  fechaEvaluacion: string;
  cumplimientoEspecificaciones: string;
  habilidadesConocimientos: string;
  oportunidadEntrega: string;
  oportunidadRespuesta: string;
  calidadProducto: string;
  resultadoEnviado: string;
  observaciones: string;
}

const Formulario5 = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [reevaluadores, setReevaluadores] = useState<string[]>([]);
  const [reevaluadorSeleccionado, setReevaluadorSeleccionado] = useState<string>('');
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [formData, setFormData] = useState<ReevaluacionFormData>({
    nombreProveedor: '',
    identificacion: '',
    productoServicio: '',
    responsableReevaluacion: '',
    fechaEvaluacion: '',
    cumplimientoEspecificaciones: '',
    habilidadesConocimientos: '',
    oportunidadEntrega: '',
    oportunidadRespuesta: '',
    calidadProducto: '',
    resultadoEnviado: '',
    observaciones: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setCargandoClientes(true);
    try {
      const response: ApiResponse<Cliente[]> = await powerAutomateService.getClientes();
      if (response.success && response.data) {
        setClientes(response.data);
        
        // Extraer reevaluadores únicos de todas las columnas REEVALUADOR1-6
        const reevaluadoresSet = new Set<string>();
        response.data.forEach(cliente => {
          for (let i = 1; i <= 6; i++) {
            const reevaluador = cliente[`REEVALUADOR${i}` as keyof Cliente];
            if (reevaluador && typeof reevaluador === 'string' && reevaluador.trim()) {
              reevaluadoresSet.add(reevaluador.trim());
            }
          }
        });
        
        setReevaluadores(Array.from(reevaluadoresSet).sort());
      }
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setCargandoClientes(false);
    }
  };

  const handleReevaluadorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reevaluador = e.target.value;
    setReevaluadorSeleccionado(reevaluador);
    
    // Actualizar el responsable en el formData
    setFormData(prev => ({ ...prev, responsableReevaluacion: reevaluador }));
    
    if (reevaluador) {
      // Filtrar proveedores que tienen este reevaluador en alguna columna REEVALUADOR1-6
      const filtrados = clientes.filter(cliente => {
        for (let i = 1; i <= 6; i++) {
          const reevaluadorCliente = cliente[`REEVALUADOR${i}` as keyof Cliente];
          if (reevaluadorCliente && typeof reevaluadorCliente === 'string' && 
              reevaluadorCliente.trim() === reevaluador) {
            return true;
          }
        }
        return false;
      });
      setClientesFiltrados(filtrados);
    } else {
      setClientesFiltrados([]);
      // Limpiar datos del proveedor si se deselecciona reevaluador
      setFormData({
        ...formData,
        responsableReevaluacion: '',
        nombreProveedor: '',
        identificacion: '',
        productoServicio: '',
      });
    }
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = e.target.value;
    const clienteSeleccionado = clientesFiltrados.find(c => c.ItemInternalId === clienteId);
    
    if (clienteSeleccionado) {
      setFormData({
        ...formData,
        nombreProveedor: clienteSeleccionado['NOMBRE DEL PROVEEDOR'] || '',
        identificacion: clienteSeleccionado['IDENTIFICACIÓN'] || '',
        productoServicio: clienteSeleccionado['PRODUCTO / SERVICIO QUE SUMINISTRA'] || '',
      });
    } else if (!clienteId) {
      setFormData({
        ...formData,
        nombreProveedor: '',
        identificacion: '',
        productoServicio: '',
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
    if (!formData.responsableReevaluacion.trim()) {
      setError('El responsable de reevaluación es requerido');
      return false;
    }
    if (!formData.fechaEvaluacion) {
      setError('La fecha de evaluación es requerida');
      return false;
    }
    if (!formData.cumplimientoEspecificaciones.trim()) {
      setError('El cumplimiento de especificaciones es requerido');
      return false;
    }
    if (!formData.habilidadesConocimientos.trim()) {
      setError('Las habilidades y conocimientos son requeridos');
      return false;
    }
    if (!formData.oportunidadEntrega.trim()) {
      setError('La oportunidad en tiempos de entrega es requerida');
      return false;
    }
    if (!formData.oportunidadRespuesta.trim()) {
      setError('La oportunidad de respuesta es requerida');
      return false;
    }
    if (!formData.calidadProducto.trim()) {
      setError('La calidad del producto/servicio es requerida');
      return false;
    }
    if (!formData.resultadoEnviado) {
      setError('Debe indicar si se envió el resultado');
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
      const response = await powerAutomateService.submitFormulario5(formData as any);

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
    setFormData({
      nombreProveedor: '',
      identificacion: '',
      productoServicio: '',
      responsableReevaluacion: '',
      fechaEvaluacion: '',
      cumplimientoEspecificaciones: '',
      habilidadesConocimientos: '',
      oportunidadEntrega: '',
      oportunidadRespuesta: '',
      calidadProducto: '',
      resultadoEnviado: '',
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
          <h1 className="success-title">¡Reevaluación Registrada Exitosamente!</h1>
          <p className="success-message">
            Los datos de la reevaluación han sido guardados correctamente.
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
              Registrar Otra Reevaluación
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

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="btn-back" onClick={() => window.location.href = '/'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        <h1>Reevaluación de Proveedores</h1>
        <p className="form-description">Complete la información de reevaluación del proveedor</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-section">
          <h2>Responsable de Reevaluación</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="responsableReevaluacion">Responsable de reevaluación *</label>
              <select
                id="responsableReevaluacion"
                name="responsableReevaluacion"
                value={reevaluadorSeleccionado}
                onChange={handleReevaluadorChange}
                className="form-input"
                disabled={cargandoClientes}
                required
              >
                <option value="">
                  {cargandoClientes ? 'Cargando reevaluadores...' : 'Seleccione el reevaluador'}
                </option>
                {reevaluadores.map((reevaluador) => (
                  <option key={reevaluador} value={reevaluador}>
                    {reevaluador}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fechaEvaluacion">Fecha de evaluación *</label>
              <input
                type="date"
                id="fechaEvaluacion"
                name="fechaEvaluacion"
                value={formData.fechaEvaluacion}
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
            {cargandoClientes ? (
              <p>Cargando proveedores...</p>
            ) : (
              <select
                id="cliente"
                onChange={handleClienteChange}
                className="form-input"
                disabled={!reevaluadorSeleccionado}
              >
                <option value="">
                  {!reevaluadorSeleccionado 
                    ? 'Primero seleccione el reevaluador' 
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
            )}
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
          <h2>Criterios de Evaluación</h2>
          
          <div className="form-group">
            <label htmlFor="cumplimientoEspecificaciones">
              Cumplimiento especificaciones contractuales o negociación inicial (20%) *
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
            <label htmlFor="habilidadesConocimientos">
              Habilidades y conocimientos técnicos (20%) *
            </label>
            <select
              id="habilidadesConocimientos"
              name="habilidadesConocimientos"
              value={formData.habilidadesConocimientos}
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
              Oportunidad en los tiempos de entrega (20%) *
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
            <label htmlFor="oportunidadRespuesta">
              Oportunidad de respuesta en quejas, reclamos, ayudas, inquietudes (20%) *
            </label>
            <select
              id="oportunidadRespuesta"
              name="oportunidadRespuesta"
              value={formData.oportunidadRespuesta}
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
              Calidad del producto/servicio en uso (20%) *
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
              <option value="Excelente Calidad">Excelente Calidad</option>
              <option value="Calidad regular">Calidad regular</option>
              <option value="Mala Calidad">Mala Calidad</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Información Adicional</h2>
          
          <div className="form-group" style={{ display: 'none' }}>
            <label htmlFor="resultadoEnviado">¿Se envió el resultado de la evaluación? *</label>
            <select
              id="resultadoEnviado"
              name="resultadoEnviado"
              value={formData.resultadoEnviado}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              className="form-input"
              rows={4}
              placeholder="Ingrese observaciones adicionales sobre la reevaluación..."
            />
          </div>
        </div>

        <div className="form-actions">
          <Link to="/" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar Reevaluación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Formulario5;
