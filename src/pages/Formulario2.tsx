import { useState } from 'react';
import { Link } from 'react-router-dom';
import { powerAutomateService } from '../services/powerAutomateService';
import ExcelJS from 'exceljs';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import '../components/forms/FormularioBase.css';

interface SeleccionFormData {
  fechaSeleccion: string;
  nombreRazonSocial: string;
  direccion: string;
  ciudad: string;
  nit: string;
  bienServicio: string;
  // Contacto
  nombreContacto: string;
  cargoContacto: string;
  correoContacto: string;
  celularContacto: string;
  telefonoContacto: string;
  // Items de evaluación
  tipoProveedor: string;
  tipo: string;
  // Criterios (cada uno guarda el puntaje: 3, 2 o 1)
  plazoPago: string;
  precio: string;
  servicioNecesidad: string;
  cumplimientoNormativo: string;
  sistemaGestion: string;
  referencias: string;
  experiencia: string;
  documentacion: string;
  // Datos de quien selecciona
  nombreSeleccionador: string;
  cargoSeleccionador: string;
  observaciones: string;
}

interface ProveedorEvaluado extends SeleccionFormData {
  puntajeTotal: number;
}

const Formulario2 = () => {
  const [proveedoresEvaluados, setProveedoresEvaluados] = useState<ProveedorEvaluado[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mejorProveedor, setMejorProveedor] = useState<ProveedorEvaluado | null>(null);
  const [formData, setFormData] = useState<SeleccionFormData>({
    fechaSeleccion: '',
    nombreRazonSocial: '',
    direccion: '',
    ciudad: '',
    nit: '',
    bienServicio: '',
    nombreContacto: '',
    cargoContacto: '',
    correoContacto: '',
    celularContacto: '',
    telefonoContacto: '',
    tipoProveedor: '',
    tipo: '',
    plazoPago: '',
    precio: '',
    servicioNecesidad: '',
    cumplimientoNormativo: '',
    sistemaGestion: '',
    referencias: '',
    experiencia: '',
    documentacion: '',
    nombreSeleccionador: '',
    cargoSeleccionador: '',
    observaciones: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcularPuntajeTotal = (data: SeleccionFormData): number => {
    const porcentajes = {
      plazoPago: 0.15,        // 15%
      precio: 0.15,           // 15%
      servicioNecesidad: 0.15, // 15%
      cumplimientoNormativo: 0.10, // 10%
      sistemaGestion: 0.10,   // 10%
      referencias: 0.15,      // 15%
      experiencia: 0.15,      // 15%
      documentacion: 0.05,    // 5%
    };

    const puntaje = (
      parseInt(data.plazoPago || '0') * porcentajes.plazoPago +
      parseInt(data.precio || '0') * porcentajes.precio +
      parseInt(data.servicioNecesidad || '0') * porcentajes.servicioNecesidad +
      parseInt(data.cumplimientoNormativo || '0') * porcentajes.cumplimientoNormativo +
      parseInt(data.sistemaGestion || '0') * porcentajes.sistemaGestion +
      parseInt(data.referencias || '0') * porcentajes.referencias +
      parseInt(data.experiencia || '0') * porcentajes.experiencia +
      parseInt(data.documentacion || '0') * porcentajes.documentacion
    );

    // Redondear a 2 decimales
    return Math.round(puntaje * 100) / 100;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.fechaSeleccion) {
      setError('La fecha de selección es requerida');
      return false;
    }
    if (!formData.nombreRazonSocial.trim()) {
      setError('El nombre o razón social es requerido');
      return false;
    }
    if (!formData.nit.trim()) {
      setError('El NIT es requerido');
      return false;
    }
    if (!formData.bienServicio.trim()) {
      setError('El bien o servicio es requerido');
      return false;
    }
    if (!formData.nombreContacto.trim()) {
      setError('El nombre del contacto es requerido');
      return false;
    }
    if (!formData.correoContacto.trim()) {
      setError('El correo del contacto es requerido');
      return false;
    }
    if (!formData.tipoProveedor) {
      setError('Debe seleccionar el tipo de proveedor');
      return false;
    }
    if (!formData.tipo) {
      setError('Debe seleccionar si es servicio o producto');
      return false;
    }
    // Validar que todos los criterios estén seleccionados
    if (!formData.plazoPago) {
      setError('Debe calificar el plazo de pago');
      return false;
    }
    if (!formData.precio) {
      setError('Debe calificar el precio');
      return false;
    }
    if (!formData.servicioNecesidad) {
      setError('Debe calificar el servicio/necesidad');
      return false;
    }
    if (!formData.cumplimientoNormativo) {
      setError('Debe calificar el cumplimiento normativo');
      return false;
    }
    if (!formData.sistemaGestion) {
      setError('Debe calificar el sistema de gestión');
      return false;
    }
    if (!formData.referencias) {
      setError('Debe calificar las referencias comerciales');
      return false;
    }
    if (!formData.experiencia) {
      setError('Debe calificar la experiencia');
      return false;
    }
    if (!formData.documentacion) {
      setError('Debe calificar la documentación');
      return false;
    }
    return true;
  };

  const agregarProveedor = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    const puntajeTotal = calcularPuntajeTotal(formData);
    const nuevoProveedor: ProveedorEvaluado = {
      ...formData,
      puntajeTotal,
    };

    setProveedoresEvaluados([...proveedoresEvaluados, nuevoProveedor]);
    
    // Limpiar formulario para agregar otro proveedor
    setFormData({
      fechaSeleccion: formData.fechaSeleccion, // Mantener la misma fecha
      nombreRazonSocial: '',
      direccion: '',
      ciudad: '',
      nit: '',
      bienServicio: '',
      nombreContacto: '',
      cargoContacto: '',
      correoContacto: '',
      celularContacto: '',
      telefonoContacto: '',
      tipoProveedor: '',
      tipo: '',
      plazoPago: '',
      precio: '',
      servicioNecesidad: '',
      cumplimientoNormativo: '',
      sistemaGestion: '',
      referencias: '',
      experiencia: '',
      documentacion: '',
      nombreSeleccionador: formData.nombreSeleccionador, // Mantener quien selecciona
      cargoSeleccionador: formData.cargoSeleccionador, // Mantener cargo
      observaciones: '',
    });

    setError(null);
  };

  const descargarCartaSeleccion = async (proveedor: ProveedorEvaluado) => {
    try {
      // Cargar el template Word desde public
      const response = await fetch('/Carta Seleccion.docx');
      const arrayBuffer = await response.arrayBuffer();
      
      // Cargar el documento con PizZip
      const zip = new PizZip(arrayBuffer);
      
      // Crear instancia de docxtemplater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '@@',
          end: '@@'
        }
      });
      
      // Formatear fecha actual en formato largo español
      const fechaActual = new Date();
      const opciones: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opciones);
      
      // Reemplazar los placeholders
      doc.setData({
        NOMBREPROVEEDOR: proveedor.nombreRazonSocial,
        PUNTAJEFINAL: proveedor.puntajeTotal.toString(),
        FECHAHOY: fechaFormateada
      });
      
      // Renderizar el documento
      doc.render();
      
      // Generar el archivo Word
      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      
      // Descargar el archivo
      const url = window.URL.createObjectURL(output);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Carta_Seleccion_${proveedor.nombreRazonSocial.replace(/\s+/g, '_')}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar carta:', error);
      alert('Error al generar la carta. Verifique que el archivo "Carta Seleccion.docx" exista en la carpeta public');
    }
  };

  const descargarFormatoSeleccion = async (proveedor: ProveedorEvaluado) => {
    try {
      // Cargar el template Excel desde public
      const response = await fetch('/Formato Seleccion.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      
      // Leer el workbook con ExcelJS (preserva estilos, colores, imágenes)
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      // Obtener la primera hoja
      const worksheet = workbook.worksheets[0];
      
      if (!worksheet) {
        throw new Error('No se encontró la hoja de trabajo');
      }
      
      // Llenar las celdas con los datos del proveedor
      // Formatear la fecha en formato largo en español
      const fecha = new Date(proveedor.fechaSeleccion + 'T00:00:00');
      const opciones: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
      
      worksheet.getCell('C4').value = fechaFormateada;
      worksheet.getCell('A6').value = proveedor.nombreRazonSocial;
      worksheet.getCell('A8').value = proveedor.direccion;
      worksheet.getCell('E8').value = proveedor.ciudad;
      worksheet.getCell('G8').value = proveedor.nit;
      worksheet.getCell('A10').value = proveedor.bienServicio;
      
      // Datos de contacto
      worksheet.getCell('A14').value = proveedor.nombreContacto;
      worksheet.getCell('E14').value = proveedor.cargoContacto;
      worksheet.getCell('A16').value = proveedor.correoContacto;
      worksheet.getCell('E16').value = proveedor.celularContacto;
      worksheet.getCell('G16').value = proveedor.telefonoContacto;
      
      // Tipo de proveedor
      if (proveedor.tipoProveedor === 'Persona Natural') {
        worksheet.getCell('D18').value = 'X';
      } else if (proveedor.tipoProveedor === 'Persona Jurídica') {
        worksheet.getCell('G18').value = 'X';
      }
      
      // Tipo (Servicio/Producto)
      if (proveedor.tipo === 'Servicio') {
        worksheet.getCell('D19').value = 'X';
      } else if (proveedor.tipo === 'Producto') {
        worksheet.getCell('G19').value = 'X';
      }
      
      // Criterios de evaluación (F22 a F29)
      worksheet.getCell('F22').value = parseInt(proveedor.plazoPago || '0');
      worksheet.getCell('F23').value = parseInt(proveedor.precio || '0');
      worksheet.getCell('F24').value = parseInt(proveedor.servicioNecesidad || '0');
      worksheet.getCell('F25').value = parseInt(proveedor.cumplimientoNormativo || '0');
      worksheet.getCell('F26').value = parseInt(proveedor.sistemaGestion || '0');
      worksheet.getCell('F27').value = parseInt(proveedor.referencias || '0');
      worksheet.getCell('F28').value = parseInt(proveedor.experiencia || '0');
      worksheet.getCell('F29').value = parseInt(proveedor.documentacion || '0');
      
      // Datos de quien selecciona
      worksheet.getCell('A32').value = proveedor.nombreSeleccionador;
      worksheet.getCell('D32').value = proveedor.cargoSeleccionador;
      
      // Observaciones
      worksheet.getCell('A38').value = proveedor.observaciones;
      
      // Generar el archivo Excel con todos los estilos preservados
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Crear blob y descargar
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Formato_Seleccion_${proveedor.nombreRazonSocial.replace(/\s+/g, '_')}_${proveedor.fechaSeleccion}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar formato:', error);
      alert('Error al generar el archivo Excel');
    }
  };

  const calcularResultados = () => {
    if (proveedoresEvaluados.length === 0) {
      setError('Debe agregar al menos un proveedor antes de calcular resultados');
      return;
    }

    // Encontrar el proveedor con mayor puntaje
    const mejor = proveedoresEvaluados.reduce((max, proveedor) => 
      proveedor.puntajeTotal > max.puntajeTotal ? proveedor : max
    );

    setMejorProveedor(mejor);
    setMostrarResultados(true);
  };

  const eliminarProveedor = (index: number) => {
    const nuevaLista = proveedoresEvaluados.filter((_, i) => i !== index);
    setProveedoresEvaluados(nuevaLista);
  };

  const enviarAPoweAutomate = async () => {
    setEnviando(true);
    
    try {
      // Enviar todos los proveedores evaluados y el resultado
      const dataToSend = {
        proveedores: proveedoresEvaluados,
        mejorProveedor: mejorProveedor,
        fechaEvaluacion: proveedoresEvaluados[0]?.fechaSeleccion || new Date().toISOString(),
      };

      const response = await powerAutomateService.submitFormulario2(dataToSend);

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

  const reiniciarTodo = () => {
    setProveedoresEvaluados([]);
    setMostrarResultados(false);
    setMejorProveedor(null);
    setRegistroExitoso(false);
    setFormData({
      fechaSeleccion: '',
      nombreRazonSocial: '',
      direccion: '',
      ciudad: '',
      nit: '',
      bienServicio: '',
      nombreContacto: '',
      cargoContacto: '',
      correoContacto: '',
      celularContacto: '',
      telefonoContacto: '',
      tipoProveedor: '',
      tipo: '',
      plazoPago: '',
      precio: '',
      servicioNecesidad: '',
      cumplimientoNormativo: '',
      sistemaGestion: '',
      referencias: '',
      experiencia: '',
      documentacion: '',
      observaciones: '',
    });
  };

  if (registroExitoso) {
    return (
      <div className="success-screen">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h1>¡Selección Registrada Exitosamente!</h1>
          <p>Los datos de selección han sido guardados correctamente.</p>
          
          <div className="success-actions">
            <button onClick={reiniciarTodo} className="btn btn-primary">
              Nueva Evaluación
            </button>
            <Link to="/" className="btn btn-secondary">
              Volver al Menú Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (mostrarResultados) {
    return (
      <div className="form-container">
        <div className="form-header">
          <h1>Resultados de la Selección</h1>
          <p className="form-description">Comparación de proveedores evaluados</p>
        </div>

        <div className="form-content">
          <div className="form-section">
            <h2>Proveedores Evaluados</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              {proveedoresEvaluados.map((proveedor, index) => (
                <div 
                  key={index} 
                  style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    border: proveedor === mejorProveedor ? '3px solid #10b981' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: proveedor === mejorProveedor ? '#f0fdf4' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1e3a8a' }}>
                        {proveedor.nombreRazonSocial}
                        {proveedor === mejorProveedor && (
                          <span style={{ 
                            marginLeft: '1rem', 
                            color: '#10b981', 
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            ⭐ MEJOR OPCIÓN
                          </span>
                        )}
                      </h3>
                      <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>NIT: {proveedor.nit}</p>
                      <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                        Bien/Servicio: {proveedor.bienServicio}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        color: proveedor === mejorProveedor ? '#10b981' : '#1e3a8a'
                      }}>
                        {proveedor.puntajeTotal}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        puntos
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => descargarFormatoSeleccion(proveedor)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                      📥 Descargar Formato
                    </button>
                    <button
                      type="button"
                      onClick={() => descargarCartaSeleccion(proveedor)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#1e3a8a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                    >
                      📄 Descargar Notificación - Carta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {mejorProveedor && (
            <div className="form-section">
              <h2>Recomendación</h2>
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f0fdf4', 
                border: '2px solid #10b981',
                borderRadius: '8px'
              }}>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#047857' }}>
                  <strong>Se recomienda seleccionar a:</strong> {mejorProveedor.nombreRazonSocial}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', color: '#065f46' }}>
                  Con un puntaje total de <strong>{mejorProveedor.puntajeTotal} puntos</strong> sobre un máximo de 3.00 puntos posibles.
                </p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              onClick={() => setMostrarResultados(false)} 
              className="btn btn-secondary"
            >
              Volver a Editar
            </button>
            <Link to="/" className="btn btn-primary">
              Volver al Menú
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
        <h1>Selección de Proveedores</h1>
        <p className="form-description">Complete la información de selección del proveedor</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {proveedoresEvaluados.length > 0 && (
        <div className="form-section" style={{ marginBottom: '2rem' }}>
          <h2>Proveedores Agregados ({proveedoresEvaluados.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {proveedoresEvaluados.map((proveedor, index) => (
              <div 
                key={index}
                style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div>
                  <strong>{proveedor.nombreRazonSocial}</strong>
                  <span style={{ marginLeft: '1rem', color: '#6b7280' }}>
                    NIT: {proveedor.nit}
                  </span>
                  <span style={{ marginLeft: '1rem', color: '#1e3a8a', fontWeight: 'bold' }}>
                    Puntaje: {proveedor.puntajeTotal}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => eliminarProveedor(index)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={agregarProveedor} className="form-content">
        <div className="form-section">
          <h2>Información General</h2>
          
          <div className="form-group">
            <label htmlFor="fechaSeleccion">Fecha de la selección *</label>
            <input
              type="date"
              id="fechaSeleccion"
              name="fechaSeleccion"
              value={formData.fechaSeleccion}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nombreRazonSocial">Nombre o razón social *</label>
            <input
              type="text"
              id="nombreRazonSocial"
              name="nombreRazonSocial"
              value={formData.nombreRazonSocial}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ciudad">Ciudad</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nit">NIT *</label>
              <input
                type="text"
                id="nit"
                name="nit"
                value={formData.nit}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bienServicio">Bien o servicio a adquirir *</label>
              <input
                type="text"
                id="bienServicio"
                name="bienServicio"
                value={formData.bienServicio}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Contacto</h2>
          
          <div className="form-group">
            <label htmlFor="nombreContacto">Nombre y apellidos *</label>
            <input
              type="text"
              id="nombreContacto"
              name="nombreContacto"
              value={formData.nombreContacto}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cargoContacto">Cargo</label>
              <input
                type="text"
                id="cargoContacto"
                name="cargoContacto"
                value={formData.cargoContacto}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="correoContacto">Correo electrónico *</label>
              <input
                type="email"
                id="correoContacto"
                name="correoContacto"
                value={formData.correoContacto}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="celularContacto">Celular</label>
              <input
                type="tel"
                id="celularContacto"
                name="celularContacto"
                value={formData.celularContacto}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefonoContacto">Teléfono</label>
              <input
                type="tel"
                id="telefonoContacto"
                name="telefonoContacto"
                value={formData.telefonoContacto}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Items de Evaluación</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipoProveedor">Tipo de Proveedor *</label>
              <select
                id="tipoProveedor"
                name="tipoProveedor"
                value={formData.tipoProveedor}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Seleccione una opción</option>
                <option value="Persona Natural">Persona Natural</option>
                <option value="Persona Jurídica">Persona Jurídica</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipo">Tipo *</label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Seleccione una opción</option>
                <option value="Servicio">Servicio</option>
                <option value="Producto">Producto</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Criterios de Evaluación</h2>
          
          <div className="form-group">
            <label htmlFor="plazoPago">Plazo de pago *</label>
            <select
              id="plazoPago"
              name="plazoPago"
              value={formData.plazoPago}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="3">Mayor a 30 días</option>
              <option value="2">Entre 15 y 30 días</option>
              <option value="1">Contado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio *</label>
            <select
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="3">Menor precio de los oferentes</option>
              <option value="2">Precio promedio de los oferentes</option>
              <option value="1">Mayor precio de los oferentes</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="servicioNecesidad">Servicio o necesidad cumple con lo requerido *</label>
            <select
              id="servicioNecesidad"
              name="servicioNecesidad"
              value={formData.servicioNecesidad}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="3">Cumple</option>
              <option value="2">Cumple parcialmente</option>
              <option value="1">No cumple</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cumplimientoNormativo">Cumplimiento normativo transparencia y ética empresarial (SAGRILAFT) *</label>
            <select
              id="cumplimientoNormativo"
              name="cumplimientoNormativo"
              value={formData.cumplimientoNormativo}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="3">Cumple</option>
              <option value="2">-</option>
              <option value="1">No cumple</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sistemaGestion">Sistema de Gestión de la Calidad *</label>
            <select
              id="sistemaGestion"
              name="sistemaGestion"
              value={formData.sistemaGestion}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="3">Tiene implementado sistema de gestión</option>
              <option value="2">No aplica</option>
              <option value="1">No tiene sistema</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="referencias">Número de referencias comerciales *</label>
            <select
              id="referencias"
              name="referencias"
              value={formData.referencias}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="3">≥2</option>
              <option value="2">1</option>
              <option value="1">Ninguna</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experiencia">Experiencia *</label>
            <select
              id="experiencia"
              name="experiencia"
              value={formData.experiencia}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="3">Más de 5 años</option>
              <option value="2">De 2 a 5 años</option>
              <option value="1">Menos de 2 años</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="documentacion">Documentación de acuerdo al procedimiento *</label>
            <select
              id="documentacion"
              name="documentacion"
              value={formData.documentacion}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="3">Completo</option>
              <option value="2">Parcial</option>
              <option value="1">No tiene</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Datos de Quien Selecciona</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombreSeleccionador">
                Nombre de quien selecciona <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombreSeleccionador"
                name="nombreSeleccionador"
                value={formData.nombreSeleccionador}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="Nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cargoSeleccionador">
                Cargo <span className="required">*</span>
              </label>
              <input
                type="text"
                id="cargoSeleccionador"
                name="cargoSeleccionador"
                value={formData.cargoSeleccionador}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="Cargo del seleccionador"
              />
            </div>
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
              placeholder="Ingrese observaciones adicionales sobre la selección..."
            />
          </div>
        </div>

        <div className="form-actions">
          <Link to="/" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary">
            Agregar Proveedor
          </button>
          {proveedoresEvaluados.length > 0 && (
            <button 
              type="button"
              onClick={calcularResultados} 
              className="btn btn-primary"
              style={{ backgroundColor: '#10b981' }}
            >
              Calcular Resultados ({proveedoresEvaluados.length} proveedores)
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Formulario2;
