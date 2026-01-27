import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { powerAutomateService } from '../../services/powerAutomateService';
import type { Cliente, FormularioData } from '../../types';
import { validateRequired } from '../../utils/validation';
import '../forms/FormularioBase.css';

interface FormularioGenericoProps {
  numeroFormulario: 1 | 2 | 3 | 4 | 5;
  titulo: string;
  descripcion: string;
  campos: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'textarea';
    required?: boolean;
    placeholder?: string;
  }>;
}

const FormularioGenerico = ({ numeroFormulario, titulo, descripcion, campos }: FormularioGenericoProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<FormularioData>({
    ClienteID: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoadingClientes(true);
    try {
      const response = await powerAutomateService.getClientes();
      if (response.success && response.data) {
        setClientes(response.data.filter(c => c.Estado === 'Activo'));
      } else {
        setMessage({ 
          type: 'error', 
          text: 'No se pudieron cargar los clientes. Verifique la configuración de Power Automate.' 
        });
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al conectar con el servidor. Por favor intente más tarde.' 
      });
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.ClienteID)) {
      newErrors.ClienteID = 'Debe seleccionar un cliente';
    }

    campos.forEach(campo => {
      if (campo.required && !validateRequired(String(formData[campo.name] || ''))) {
        newErrors[campo.name] = `${campo.label} es obligatorio`;
      }
    });

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
      let response;
      
      switch (numeroFormulario) {
        case 1:
          response = await powerAutomateService.submitFormulario1(formData);
          break;
        case 2:
          response = await powerAutomateService.submitFormulario2(formData);
          break;
        case 3:
          response = await powerAutomateService.submitFormulario3(formData);
          break;
        case 4:
          response = await powerAutomateService.submitFormulario4(formData);
          break;
        case 5:
          response = await powerAutomateService.submitFormulario5(formData);
          break;
      }

      if (response.success) {
        setMessage({ type: 'success', text: '¡Formulario enviado exitosamente!' });
        
        // Limpiar formulario
        const resetData: FormularioData = { ClienteID: '' };
        campos.forEach(campo => {
          resetData[campo.name] = '';
        });
        setFormData(resetData);

        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: response.error || 'Error al enviar el formulario. Por favor intente nuevamente.' 
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

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        <h1>{titulo}</h1>
        <p className="form-description">{descripcion}</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form card">
        {/* Selector de Cliente */}
        <div className="form-group">
          <label htmlFor="ClienteID" className="form-label">
            Cliente <span className="required">*</span>
          </label>
          {loadingClientes ? (
            <div className="spinner"></div>
          ) : (
            <>
              <select
                id="ClienteID"
                name="ClienteID"
                value={formData.ClienteID}
                onChange={handleChange}
                className={`form-select ${errors.ClienteID ? 'error' : ''}`}
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.ItemInternalId} value={cliente.ItemInternalId}>
                    {cliente['NOMBRE DEL PROVEEDOR']}{cliente['IDENTIFICACIÓN'] ? ` - ${cliente['IDENTIFICACIÓN']}` : ''}
                  </option>
                ))}
              </select>
              {errors.ClienteID && (
                <span className="form-error">{errors.ClienteID}</span>
              )}
            </>
          )}
        </div>

        {/* Campos dinámicos */}
        {campos.map(campo => (
          <div key={campo.name} className="form-group">
            <label htmlFor={campo.name} className="form-label">
              {campo.label} {campo.required && <span className="required">*</span>}
            </label>
            {campo.type === 'textarea' ? (
              <textarea
                id={campo.name}
                name={campo.name}
                value={String(formData[campo.name] || '')}
                onChange={handleChange}
                className={`form-textarea ${errors[campo.name] ? 'error' : ''}`}
                placeholder={campo.placeholder}
                rows={4}
              />
            ) : (
              <input
                type={campo.type}
                id={campo.name}
                name={campo.name}
                value={String(formData[campo.name] || '')}
                onChange={handleChange}
                className={`form-input ${errors[campo.name] ? 'error' : ''}`}
                placeholder={campo.placeholder}
              />
            )}
            {errors[campo.name] && (
              <span className="form-error">{errors[campo.name]}</span>
            )}
          </div>
        ))}

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
            disabled={loading || loadingClientes}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Enviando...
              </>
            ) : (
              'Enviar Formulario'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioGenerico;
