// Tipos de datos para la aplicación

export interface Cliente {
  ItemInternalId: string;
  'NOMBRE DEL PROVEEDOR': string;
  'IDENTIFICACIÓN': string;
  'PRODUCTO / SERVICIO QUE SUMINISTRA'?: string;
  Estado?: 'Activo' | 'Inactivo';
  EVALUADOR1?: string;
  EVALUADOR2?: string;
  EVALUADOR3?: string;
  EVALUADOR4?: string;
  EVALUADOR5?: string;
  EVALUADOR6?: string;
  REEVALUADOR1?: string;
  REEVALUADOR2?: string;
  REEVALUADOR3?: string;
  REEVALUADOR4?: string;
  REEVALUADOR5?: string;
  REEVALUADOR6?: string;
  SEGUIMIENTO1?: string;
  SEGUIMIENTO2?: string;
  SEGUIMIENTO3?: string;
  SEGUIMIENTO4?: string;
  SEGUIMIENTO5?: string;
  SEGUIMIENTO6?: string;
  'DIRECCIÓN'?: string;
  'CIUDAD'?: string;
  'CONTACTO'?: string;
  'E-MAIL'?: string;
  'TELÉFONOS'?: string;
  'FECHA DE SELECCIÓN'?: string;
}

export interface BaseFormData {
  categoria: string;
  esCritico: 'Si' | 'No';
  anioVinculacion: string;
  nombreProveedor: string;
  identificacion: string;
  direccion: string;
  telefonos: string;
  email: string;
  contacto: string;
  ciudad: string;
  productoServicio: string;
  camaraComercio: string;
  rut: string;
  certificadoBancario: string;
  copiaCedulaRepLegal: string;
  autorizacionDatos: string;
  soportesSeguridadSocial: string;
  hojaVidaSoportes: string;
  documentosAdicionales: string;
  fechaSeleccion: string;
  observaciones: string;
  evaluador1: string;
  evaluador2: string;
  evaluador3: string;
  evaluador4: string;
  evaluador5: string;
  evaluador6: string;
  reevaluador1: string;
  reevaluador2: string;
  reevaluador3: string;
  reevaluador4: string;
  reevaluador5: string;
  reevaluador6: string;
}

export interface FormularioData {
  ClienteID: string;
  [key: string]: string | number | Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PowerAutomateConfig {
  baseFormUrl: string;
  getClientesUrl: string;
  formulario1Url: string;
  formulario2Url: string;
  formulario3Url: string;
  formulario4Url: string;
  formulario5Url: string;
  guardarExcelUrl: string;
}

export interface OneDriveExcelData {
  nombreArchivo: string;
  contenidoBase64: string;
  carpetaDestino: string;
}
