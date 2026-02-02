import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { powerAutomateService } from '../../services/powerAutomateService';
import type { BaseFormData } from '../../types';
import { validateRequired, validateEmail } from '../../utils/validation';
import './FormularioBase.css';

const FormularioBase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  
  const [formData, setFormData] = useState<BaseFormData>({
    categoria: '',
    esCritico: 'NO CRÍTICO',
    anioVinculacion: '',
    nombreProveedor: '',
    identificacion: '',
    direccion: '',
    telefonos: '',
    email: '',
    contacto: '',
    ciudad: '',
    productoServicio: '',
    camaraComercio: '',
    rut: '',
    certificadoBancario: '',
    copiaCedulaRepLegal: '',
    autorizacionDatos: '',
    balances: '',
    ofertaComercial: '',
    planContinuidad: '',
    contratoEquivalente: '',
    certificadoSGSST: '',
    documentosAdicionales: '',
    fechaSeleccion: new Date().toISOString().split('T')[0],
    observaciones: '',
    evaluador1: '',
    evaluador2: '',
    evaluador3: '',
    evaluador4: '',
    evaluador5: '',
    evaluador6: '',
    reevaluador1: '',
    reevaluador2: '',
    reevaluador3: '',
    reevaluador4: '',
    reevaluador5: '',
    reevaluador6: '',
    seguimiento1: '',
    seguimiento2: '',
    seguimiento3: '',
    seguimiento4: '',
    seguimiento5: '',
    seguimiento6: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BaseFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name as keyof BaseFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BaseFormData, string>> = {};

    if (!validateRequired(formData.categoria)) {
      newErrors.categoria = 'La categoría es obligatoria';
    }

    if (!validateRequired(formData.nombreProveedor)) {
      newErrors.nombreProveedor = 'El nombre del proveedor es obligatorio';
    }

    if (!validateRequired(formData.identificacion)) {
      newErrors.identificacion = 'La identificación es obligatoria';
    }

    if (!validateRequired(formData.direccion)) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (!validateRequired(formData.telefonos)) {
      newErrors.telefonos = 'El teléfono es obligatorio';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!validateRequired(formData.contacto)) {
      newErrors.contacto = 'El contacto es obligatorio';
    }

    if (!validateRequired(formData.ciudad)) {
      newErrors.ciudad = 'La ciudad es obligatoria';
    }

    if (!validateRequired(formData.productoServicio)) {
      newErrors.productoServicio = 'El producto/servicio es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await powerAutomateService.createCliente(formData);

      if (response.success) {
        setRegistroExitoso(true);
        
        // Limpiar formulario
        setFormData({
          categoria: '',
          esCritico: 'NO CRÍTICO',
          anioVinculacion: '',
          nombreProveedor: '',
          identificacion: '',
          direccion: '',
          telefonos: '',
          email: '',
          contacto: '',
          ciudad: '',
          productoServicio: '',
          camaraComercio: '',
          rut: '',
          certificadoBancario: '',
          copiaCedulaRepLegal: '',
          autorizacionDatos: '',
          balances: '',
          ofertaComercial: '',
          planContinuidad: '',
          contratoEquivalente: '',
          certificadoSGSST: '',
          documentosAdicionales: '',
          fechaSeleccion: new Date().toISOString().split('T')[0],
          observaciones: '',
          evaluador1: '',
          evaluador2: '',
          evaluador3: '',
          evaluador4: '',
          evaluador5: '',
          evaluador6: '',
          reevaluador1: '',
          reevaluador2: '',
          reevaluador3: '',
          reevaluador4: '',
          reevaluador5: '',
          reevaluador6: '',
          seguimiento1: '',
          seguimiento2: '',
          seguimiento3: '',
          seguimiento4: '',
          seguimiento5: '',
          seguimiento6: '',
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: response.error || 'Error al registrar el proveedor. Por favor intente nuevamente.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Error de conexión. Por favor verifique su conexión a internet.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
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
          <h1 className="success-title">¡Registro Exitoso!</h1>
          <p className="success-message">
            El proveedor ha sido registrado correctamente en el sistema.
            <br />
            Los datos se han guardado en Excel.
          </p>
          
          <div className="success-actions">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              Volver al Menú Principal
            </button>
            <button 
              className="btn btn-outline btn-lg"
              onClick={() => {
                setRegistroExitoso(false);
                setMessage(null);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Registrar Otro Proveedor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        <h1>Registro de Proveedores</h1>
        <p className="form-description">
          Complete el siguiente formulario para registrar un nuevo proveedor en el sistema
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form card">
        {/* Sección: Información General */}
        <div className="form-section">
          <h3 className="form-section-title">Información General</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoria" className="form-label">
                Categoría <span className="required">*</span>
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`form-select ${errors.categoria ? 'error' : ''}`}
              >
                <option value="">Seleccione una categoría</option>
                <option value="Natural">Natural</option>
                <option value="Juridico">Juridico</option>
              </select>
              {errors.categoria && (
                <span className="form-error">{errors.categoria}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="esCritico" className="form-label">
                ¿Es Crítico? <span className="required">*</span>
              </label>
              <select
                id="esCritico"
                name="esCritico"
                value={formData.esCritico}
                onChange={handleChange}
                className="form-select"
              >
                <option value="NO CRÍTICO">NO CRÍTICO</option>
                <option value="CRÍTICO">CRÍTICO</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="anioVinculacion" className="form-label">
                Año de vinculación <span className="required">*</span>
              </label>
              <input
                type="number"
                id="anioVinculacion"
                name="anioVinculacion"
                value={formData.anioVinculacion}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: 2026"
                min="1900"
                max="2100"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nombreProveedor" className="form-label">
              Nombre del Proveedor <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombreProveedor"
              name="nombreProveedor"
              value={formData.nombreProveedor}
              onChange={handleChange}
              className={`form-input ${errors.nombreProveedor ? 'error' : ''}`}
              placeholder="Nombre completo del proveedor"
            />
            {errors.nombreProveedor && (
              <span className="form-error">{errors.nombreProveedor}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="identificacion" className="form-label">
                Identificación <span className="required">*</span>
              </label>
              <input
                type="text"
                id="identificacion"
                name="identificacion"
                value={formData.identificacion}
                onChange={handleChange}
                className={`form-input ${errors.identificacion ? 'error' : ''}`}
                placeholder="NIT o Cédula"
              />
              {errors.identificacion && (
                <span className="form-error">{errors.identificacion}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="ciudad" className="form-label">
                Ciudad <span className="required">*</span>
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className={`form-input ${errors.ciudad ? 'error' : ''}`}
                placeholder="Ciudad"
              />
              {errors.ciudad && (
                <span className="form-error">{errors.ciudad}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="direccion" className="form-label">
              Dirección <span className="required">*</span>
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className={`form-input ${errors.direccion ? 'error' : ''}`}
              placeholder="Dirección completa"
            />
            {errors.direccion && (
              <span className="form-error">{errors.direccion}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefonos" className="form-label">
                Teléfonos <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="telefonos"
                name="telefonos"
                value={formData.telefonos}
                onChange={handleChange}
                className={`form-input ${errors.telefonos ? 'error' : ''}`}
                placeholder="3001234567"
              />
              {errors.telefonos && (
                <span className="form-error">{errors.telefonos}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contacto" className="form-label">
                Contacto <span className="required">*</span>
              </label>
              <input
                type="text"
                id="contacto"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                className={`form-input ${errors.contacto ? 'error' : ''}`}
                placeholder="Nombre del contacto principal"
              />
              {errors.contacto && (
                <span className="form-error">{errors.contacto}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="productoServicio" className="form-label">
                Producto / Servicio que Suministra <span className="required">*</span>
              </label>
              <input
                type="text"
                id="productoServicio"
                name="productoServicio"
                value={formData.productoServicio}
                onChange={handleChange}
                className={`form-input ${errors.productoServicio ? 'error' : ''}`}
                placeholder="Describa el producto o servicio"
              />
              {errors.productoServicio && (
                <span className="form-error">{errors.productoServicio}</span>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Documentación */}
        <div className="form-section">
          <h3 className="form-section-title">Documentación</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="camaraComercio" className="form-label">
                Cámara de Comercio
              </label>
              <select
                id="camaraComercio"
                name="camaraComercio"
                value={formData.camaraComercio}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rut" className="form-label">
                RUT
              </label>
              <select
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="certificadoBancario" className="form-label">
                Certificado Bancario
              </label>
              <select
                id="certificadoBancario"
                name="certificadoBancario"
                value={formData.certificadoBancario}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="copiaCedulaRepLegal" className="form-label">
                Copia Cédula Rep. Legal
              </label>
              <select
                id="copiaCedulaRepLegal"
                name="copiaCedulaRepLegal"
                value={formData.copiaCedulaRepLegal}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="autorizacionDatos" className="form-label">
                Autorización Tratamiento de Datos Personales
              </label>
              <select
                id="autorizacionDatos"
                name="autorizacionDatos"
                value={formData.autorizacionDatos}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="balances" className="form-label">
                Balances
              </label>
              <select
                id="balances"
                name="balances"
                value={formData.balances}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ofertaComercial" className="form-label">
                Oferta Comercial
              </label>
              <select
                id="ofertaComercial"
                name="ofertaComercial"
                value={formData.ofertaComercial}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="planContinuidad" className="form-label">
                Plan Continuidad
              </label>
              <select
                id="planContinuidad"
                name="planContinuidad"
                value={formData.planContinuidad}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contratoEquivalente" className="form-label">
                Contrato o equivalente
              </label>
              <select
                id="contratoEquivalente"
                name="contratoEquivalente"
                value={formData.contratoEquivalente}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="certificadoSGSST" className="form-label">
                Certificado SG-SST
              </label>
              <select
                id="certificadoSGSST"
                name="certificadoSGSST"
                value={formData.certificadoSGSST}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="documentosAdicionales" className="form-label">
              Documentos Adicionales
            </label>
            <input
              type="text"
              id="documentosAdicionales"
              name="documentosAdicionales"
              value={formData.documentosAdicionales}
              onChange={handleChange}
              className="form-input"
              placeholder="Indicar documentos adicionales"
            />
          </div>
        </div>

        {/* Sección: Información Adicional */}
        <div className="form-section">
          <h3 className="form-section-title">Información Adicional</h3>

          <div className="form-group">
            <label htmlFor="fechaSeleccion" className="form-label">
              Fecha de Selección
            </label>
            <input
              type="date"
              id="fechaSeleccion"
              name="fechaSeleccion"
              value={formData.fechaSeleccion}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="observaciones" className="form-label">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Incluir en este espacio cualquier información a tener en cuenta para la evaluación / seguimiento / reevaluación"
              rows={4}
            />
            <small className="form-helper">
              Incluir cualquier información relevante para evaluación, seguimiento o reevaluación
            </small>
          </div>
        </div>

        <div className="form-section">
          <h2>Evaluadores</h2>
          <p className="section-description">
            Asigne hasta 6 evaluadores responsables de evaluar este proveedor
          </p>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="evaluador1" className="form-label">
                Evaluador 1
              </label>
              <input
                type="text"
                id="evaluador1"
                name="evaluador1"
                value={formData.evaluador1}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del evaluador 1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="evaluador2" className="form-label">
                Evaluador 2
              </label>
              <input
                type="text"
                id="evaluador2"
                name="evaluador2"
                value={formData.evaluador2}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del evaluador 2"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="evaluador3" className="form-label">
                Evaluador 3
              </label>
              <input
                type="text"
                id="evaluador3"
                name="evaluador3"
                value={formData.evaluador3}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del evaluador 3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="evaluador4" className="form-label">
                Evaluador 4
              </label>
              <input
                type="text"
                id="evaluador4"
                name="evaluador4"
                value={formData.evaluador4}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del evaluador 4"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="evaluador5" className="form-label">
                Evaluador 5
              </label>
              <input
                type="text"
                id="evaluador5"
                name="evaluador5"
                value={formData.evaluador5}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del evaluador 5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="evaluador6" className="form-label">
                Evaluador 6
              </label>
              <input
                type="text"
                id="evaluador6"
                name="evaluador6"
                value={formData.evaluador6}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del evaluador 6"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Reevaluadores</h2>
          <p className="section-description">
            Asigne hasta 6 reevaluadores responsables de reevaluar este proveedor
          </p>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reevaluador1" className="form-label">
                Reevaluador 1
              </label>
              <input
                type="text"
                id="reevaluador1"
                name="reevaluador1"
                value={formData.reevaluador1}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del reevaluador 1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reevaluador2" className="form-label">
                Reevaluador 2
              </label>
              <input
                type="text"
                id="reevaluador2"
                name="reevaluador2"
                value={formData.reevaluador2}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del reevaluador 2"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reevaluador3" className="form-label">
                Reevaluador 3
              </label>
              <input
                type="text"
                id="reevaluador3"
                name="reevaluador3"
                value={formData.reevaluador3}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del reevaluador 3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reevaluador4" className="form-label">
                Reevaluador 4
              </label>
              <input
                type="text"
                id="reevaluador4"
                name="reevaluador4"
                value={formData.reevaluador4}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del reevaluador 4"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reevaluador5" className="form-label">
                Reevaluador 5
              </label>
              <input
                type="text"
                id="reevaluador5"
                name="reevaluador5"
                value={formData.reevaluador5}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del reevaluador 5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reevaluador6" className="form-label">
                Reevaluador 6
              </label>
              <input
                type="text"
                id="reevaluador6"
                name="reevaluador6"
                value={formData.reevaluador6}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del reevaluador 6"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Seguimiento</h2>
          <p className="section-description">
            Asigne hasta 6 responsables de seguimiento para este proveedor
          </p>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seguimiento1" className="form-label">
                Seguimiento 1
              </label>
              <input
                type="text"
                id="seguimiento1"
                name="seguimiento1"
                value={formData.seguimiento1}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del responsable de seguimiento 1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="seguimiento2" className="form-label">
                Seguimiento 2
              </label>
              <input
                type="text"
                id="seguimiento2"
                name="seguimiento2"
                value={formData.seguimiento2}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del responsable de seguimiento 2"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seguimiento3" className="form-label">
                Seguimiento 3
              </label>
              <input
                type="text"
                id="seguimiento3"
                name="seguimiento3"
                value={formData.seguimiento3}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del responsable de seguimiento 3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="seguimiento4" className="form-label">
                Seguimiento 4
              </label>
              <input
                type="text"
                id="seguimiento4"
                name="seguimiento4"
                value={formData.seguimiento4}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del responsable de seguimiento 4"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seguimiento5" className="form-label">
                Seguimiento 5
              </label>
              <input
                type="text"
                id="seguimiento5"
                name="seguimiento5"
                value={formData.seguimiento5}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del responsable de seguimiento 5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="seguimiento6" className="form-label">
                Seguimiento 6
              </label>
              <input
                type="text"
                id="seguimiento6"
                name="seguimiento6"
                value={formData.seguimiento6}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del responsable de seguimiento 6"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Guardando...
              </>
            ) : (
              'Guardar Proveedor'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioBase;
