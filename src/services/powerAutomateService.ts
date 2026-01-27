import type { Cliente, BaseFormData, FormularioData, ApiResponse, PowerAutomateConfig, OneDriveExcelData } from '../types';

// Configuración de URLs de Power Automate desde variables de entorno
const config: PowerAutomateConfig = {
  baseFormUrl: import.meta.env.VITE_BASE_FORM_URL || '',
  getClientesUrl: import.meta.env.VITE_GET_CLIENTES_URL || '',
  formulario1Url: import.meta.env.VITE_FORMULARIO1_URL || '',
  formulario2Url: import.meta.env.VITE_FORMULARIO2_URL || '',
  formulario3Url: import.meta.env.VITE_FORMULARIO3_URL || '',
  formulario4Url: import.meta.env.VITE_FORMULARIO4_URL || '',
  formulario5Url: import.meta.env.VITE_FORMULARIO5_URL || '',
  guardarExcelUrl: import.meta.env.VITE_GUARDAR_EXCEL_URL || '',
};

/**
 * Servicio para interactuar con Power Automate
 */
class PowerAutomateService {
  /**
   * Método genérico para realizar peticiones HTTP
   */
  private async request<T>(
    url: string,
    method: 'GET' | 'POST',
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Añadido para CORS
      };

      if (method === 'POST' && data) {
        options.body = JSON.stringify(data);
      }

      console.log('Enviando petición a:', url);
      console.log('Método:', method);
      console.log('Datos:', data);

      const response = await fetch(url, options);

      console.log('Respuesta status:', response.status);
      console.log('Respuesta headers:', response.headers);

      if (!response.ok) {
        // Intentar obtener más información del error
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.text();
          console.log('Error response:', errorData);
          errorMessage += ` - ${errorData}`;
        } catch (e) {
          // Si no se puede leer el cuerpo del error
        }
        throw new Error(errorMessage);
      }

      // Intentar parsear JSON, si falla asumir éxito si el status es 200
      let result: any = {};
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Solo parsear si hay contenido
        if (responseText && responseText.trim().length > 0) {
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            console.warn('No se pudo parsear JSON, pero la operación fue exitosa');
          }
        }
      }

      return {
        success: true,
        data: result,
        message: 'Operación exitosa',
      };
    } catch (error) {
      console.error('Error en petición a Power Automate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error al procesar la solicitud',
      };
    }
  }

  /**
   * Obtiene la lista de clientes activos
   */
  async getClientes(): Promise<ApiResponse<Cliente[]>> {
    return this.request<Cliente[]>(config.getClientesUrl, 'GET');
  }

  /**
   * Crea un nuevo cliente (Formulario Base)
   */
  async createCliente(data: BaseFormData): Promise<ApiResponse> {
    return this.request(config.baseFormUrl, 'POST', data);
  }

  /**
   * Envía datos del Formulario 1
   */
  async submitFormulario1(data: FormularioData): Promise<ApiResponse> {
    return this.request(config.formulario1Url, 'POST', {
      ...data,
      tipoFormulario: 'Formulario1',
    });
  }

  /**
   * Envía datos del Formulario 2
   */
  async submitFormulario2(data: FormularioData): Promise<ApiResponse> {
    return this.request(config.formulario2Url, 'POST', {
      ...data,
      tipoFormulario: 'Formulario2',
    });
  }

  /**
   * Envía datos del Formulario 3
   */
  async submitFormulario3(data: FormularioData): Promise<ApiResponse> {
    return this.request(config.formulario3Url, 'POST', {
      ...data,
      tipoFormulario: 'Formulario3',
    });
  }

  /**
   * Envía datos del Formulario 4
   */
  async submitFormulario4(data: FormularioData): Promise<ApiResponse> {
    return this.request(config.formulario4Url, 'POST', {
      ...data,
      tipoFormulario: 'Formulario4',
    });
  }

  /**
   * Envía datos del Formulario 5
   */
  async submitFormulario5(data: FormularioData): Promise<ApiResponse> {
    return this.request(config.formulario5Url, 'POST', {
      ...data,
      tipoFormulario: 'Formulario5',
    });
  }

  /**
   * Guarda un archivo Excel en OneDrive
   */
  async guardarExcelEnOneDrive(data: OneDriveExcelData): Promise<ApiResponse> {
    return this.request(config.guardarExcelUrl, 'POST', data);
  }
}

// Exportar instancia única del servicio
export const powerAutomateService = new PowerAutomateService();
