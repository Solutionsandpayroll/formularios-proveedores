import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExcelJS from 'exceljs';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import type { Cliente, ApiResponse } from '../types';
import { powerAutomateService } from '../services/powerAutomateService';
import '../components/forms/FormularioBase.css';

interface EvaluacionFormData {
  fechaPrestacion: string;
  fechaEvaluacion: string;
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
  cumplimientoEspecificaciones: string;
  habilidadesConocimientos: string;
  oportunidadEntrega: string;
  oportunidadRespuesta: string;
  calidadProducto: string;
  // Datos de quien selecciona
  nombreSeleccionador: string;
  cargoSeleccionador: string;
  observaciones: string;
}

const Formulario4 = () => {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string>('');
  const [archivosSubidos, setArchivosSubidos] = useState<File[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [evaluadores, setEvaluadores] = useState<string[]>([]);
  const [evaluadorSeleccionado, setEvaluadorSeleccionado] = useState<string>('');
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [formData, setFormData] = useState<EvaluacionFormData>({
    fechaPrestacion: '',
    fechaEvaluacion: '',
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
    cumplimientoEspecificaciones: '',
    habilidadesConocimientos: '',
    oportunidadEntrega: '',
    oportunidadRespuesta: '',
    calidadProducto: '',
    nombreSeleccionador: '',
    cargoSeleccionador: '',
    observaciones: '',
  });
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [aprueba, setAprueba] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archivoInforme, setArchivoInforme] = useState<File | null>(null);
  const [procesandoCarta, setProcesandoCarta] = useState(false);

  const opciones = [
    { id: 'formulario', nombre: 'Formulario de evaluación' },
    { id: 'informe', nombre: 'Informe de evaluación' },
  ];

  const seleccionarOpcion = async (opcion: string) => {
    setOpcionSeleccionada(opcion);
    
    // Si selecciona formulario, cargar proveedores
    if (opcion === 'formulario') {
      setCargandoClientes(true);
      try {
        const response: ApiResponse<Cliente[]> = await powerAutomateService.getClientes();
        if (response.success && response.data) {
          setClientes(response.data);
          
          // Extraer evaluadores únicos de todas las columnas EVALUADOR1-6
          const evaluadoresSet = new Set<string>();
          response.data.forEach(cliente => {
            for (let i = 1; i <= 6; i++) {
              const evaluador = cliente[`EVALUADOR${i}` as keyof Cliente];
              if (evaluador && typeof evaluador === 'string' && evaluador.trim()) {
                evaluadoresSet.add(evaluador.trim());
              }
            }
          });
          
          setEvaluadores(Array.from(evaluadoresSet).sort());
        }
      } catch (err) {
        console.error('Error cargando clientes:', err);
      } finally {
        setCargandoClientes(false);
      }
    }
  };

  const handleEvaluadorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const evaluador = e.target.value;
    setEvaluadorSeleccionado(evaluador);
    
    // Actualizar el nombre del evaluador en el formData
    setFormData(prev => ({ ...prev, nombreSeleccionador: evaluador }));
    
    if (evaluador) {
      // Filtrar proveedores que tienen este evaluador en alguna columna EVALUADOR1-6
      const filtrados = clientes.filter(cliente => {
        for (let i = 1; i <= 6; i++) {
          const evaluadorCliente = cliente[`EVALUADOR${i}` as keyof Cliente];
          if (evaluadorCliente && typeof evaluadorCliente === 'string' && 
              evaluadorCliente.trim() === evaluador) {
            return true;
          }
        }
        return false;
      });
      setClientesFiltrados(filtrados);
    } else {
      setClientesFiltrados([]);
      // Limpiar datos del proveedor si se deselecciona evaluador
      setFormData({
        ...formData,
        nombreSeleccionador: '',
        nombreRazonSocial: '',
        nit: '',
        bienServicio: '',
        direccion: '',
        ciudad: '',
      });
    }
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = e.target.value;
    const clienteSeleccionado = clientesFiltrados.find(c => c.ItemInternalId === clienteId);
    
    if (clienteSeleccionado) {
      setFormData({
        ...formData,
        nombreRazonSocial: clienteSeleccionado['NOMBRE DEL PROVEEDOR'] || '',
        nit: clienteSeleccionado['IDENTIFICACIÓN'] || '',
        bienServicio: clienteSeleccionado['PRODUCTO / SERVICIO QUE SUMINISTRA'] || '',
        direccion: clienteSeleccionado['DIRECCIÓN'] || '',
        ciudad: clienteSeleccionado['CIUDAD'] || '',
        nombreContacto: clienteSeleccionado['CONTACTO'] || '',
        correoContacto: clienteSeleccionado['E-MAIL'] || '',
        telefonoContacto: clienteSeleccionado['TELÉFONOS'] || '',
      });
    } else if (!clienteId) {
      // Si se deselecciona, limpiar los campos
      setFormData({
        ...formData,
        nombreRazonSocial: '',
        nit: '',
        bienServicio: '',
        direccion: '',
        ciudad: '',
        nombreContacto: '',
        correoContacto: '',
        telefonoContacto: '',
      });
    }
  };

  const handleArchivosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files).filter(
        file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      setArchivosSubidos([...archivosSubidos, ...nuevosArchivos]);
    }
  };

  const eliminarArchivo = (index: number) => {
    setArchivosSubidos(archivosSubidos.filter((_, i) => i !== index));
  };

  const handleArchivoInformeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const archivo = e.target.files[0];
      if (archivo.name.endsWith('.xlsx') || archivo.name.endsWith('.xls')) {
        setArchivoInforme(archivo);
      } else {
        alert('Por favor seleccione un archivo Excel válido (.xlsx o .xls)');
      }
    }
  };

  const generarCartaEvaluacion = async () => {
    if (!archivoInforme) {
      alert('Debe subir el archivo Excel de evaluación final');
      return;
    }

    setProcesandoCarta(true);
    try {
      // Leer el archivo Excel de evaluación
      const arrayBuffer = await archivoInforme.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new Error('No se encontró la hoja de trabajo en el archivo');
      }

      // Extraer datos del Excel
      const nombreProveedor = worksheet.getCell('A6').value || '';
      const promedioF23 = worksheet.getCell('F23').value || 0;
      const promedioF24 = worksheet.getCell('F24').value || 0;
      const promedioF25 = worksheet.getCell('F25').value || 0;
      const promedioF26 = worksheet.getCell('F26').value || 0;
      const promedioF27 = worksheet.getCell('F27').value || 0;

      // Calcular puntaje total (promedio de los 5 criterios)
      const puntajeFinal = (
        Number(promedioF23) + 
        Number(promedioF24) + 
        Number(promedioF25) + 
        Number(promedioF26) + 
        Number(promedioF27)
      ) / 5;

      const puntajeFinalRedondeado = Math.round(puntajeFinal * 10) / 10;

      // Cargar el template de la carta
      const response = await fetch('/Carta Evaluacion.docx');
      if (!response.ok) {
        throw new Error('No se encontró el template de la carta');
      }

      const arrayBufferDoc = await response.arrayBuffer();
      const zip = new PizZip(arrayBufferDoc);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '@@', end: '@@' }
      });

      // Fecha actual en formato largo (sin día de la semana)
      const fechaActual = new Date();
      const opciones: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opciones);

      // Reemplazar placeholders
      doc.render({
        NOMBREPROVEEDOR: nombreProveedor,
        PUNTAJEFINAL: puntajeFinalRedondeado,
        FECHAHOY: fechaFormateada
      });

      // Generar el documento
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Descargar
      const url = window.URL.createObjectURL(out);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Carta_Evaluacion_${String(nombreProveedor).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);

      alert('Carta de evaluación generada exitosamente');
    } catch (error) {
      console.error('Error al generar carta de evaluación:', error);
      alert('Error al generar la carta de evaluación. Revise la consola para más detalles.');
    } finally {
      setProcesandoCarta(false);
    }
  };

  const generarEvaluacionFinal = async () => {
    if (archivosSubidos.length === 0) {
      alert('Debe subir al menos un archivo Excel');
      return;
    }

    setProcesando(true);
    try {
      // Arrays para almacenar los valores de cada celda
      const valoresF23: number[] = [];
      const valoresF24: number[] = [];
      const valoresF25: number[] = [];
      const valoresF26: number[] = [];
      const valoresF27: number[] = [];
      const valoresA30: string[] = [];
      const valoresE30: string[] = [];
      const valoresA36: string[] = [];

      // Variables para almacenar valores del primer archivo
      let datosDelPrimerArchivo: any = {};

      // Leer todos los archivos Excel y extraer valores
      for (let i = 0; i < archivosSubidos.length; i++) {
        const archivo = archivosSubidos[i];
        try {
          console.log(`Procesando archivo ${i + 1}/${archivosSubidos.length}: ${archivo.name}`);
          
          const arrayBuffer = await archivo.arrayBuffer();
          console.log(`ArrayBuffer cargado, tamaño: ${arrayBuffer.byteLength} bytes`);
          
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(arrayBuffer);
          console.log(`Workbook cargado exitosamente`);
          
          const worksheet = workbook.worksheets[0];

          if (worksheet) {
            const valorF23 = worksheet.getCell('F23').value;
            const valorF24 = worksheet.getCell('F24').value;
            const valorF25 = worksheet.getCell('F25').value;
            const valorF26 = worksheet.getCell('F26').value;
            const valorF27 = worksheet.getCell('F27').value;
            const valorA30 = worksheet.getCell('A30').value;
            const valorE30 = worksheet.getCell('E30').value;
            const valorA36 = worksheet.getCell('A36').value;

            console.log('Valores extraídos:', { valorF23, valorF24, valorF25, valorF26, valorF27, valorA30, valorE30, valorA36 });

            if (typeof valorF23 === 'number') valoresF23.push(valorF23);
            if (typeof valorF24 === 'number') valoresF24.push(valorF24);
            if (typeof valorF25 === 'number') valoresF25.push(valorF25);
            if (typeof valorF26 === 'number') valoresF26.push(valorF26);
            if (typeof valorF27 === 'number') valoresF27.push(valorF27);
            if (valorA30 !== null && valorA30 !== undefined && valorA30 !== '') {
              valoresA30.push(String(valorA30));
            }
            if (valorE30 !== null && valorE30 !== undefined && valorE30 !== '') {
              valoresE30.push(String(valorE30));
            }
            if (valorA36 !== null && valorA36 !== undefined && valorA36 !== '') {
              valoresA36.push(String(valorA36));
            }

            // Si es el primer archivo, guardar valores adicionales para copiar al resultado
            if (i === 0) {
              datosDelPrimerArchivo = {
                C4: worksheet.getCell('C4').value,
                A6: worksheet.getCell('A6').value,
                A8: worksheet.getCell('A8').value,
                E8: worksheet.getCell('E8').value,
                G8: worksheet.getCell('G8').value,
                A10: worksheet.getCell('A10').value,
                A14: worksheet.getCell('A14').value,
                E14: worksheet.getCell('E14').value,
                A16: worksheet.getCell('A16').value,
                E16: worksheet.getCell('E16').value,
                G16: worksheet.getCell('G16').value,
                D18: worksheet.getCell('D18').value,
                G18: worksheet.getCell('G18').value,
                D19: worksheet.getCell('D19').value,
                G19: worksheet.getCell('G19').value
              };
              console.log('Datos del primer archivo guardados:', datosDelPrimerArchivo);
            }
          }
        } catch (error) {
          console.error(`Error al procesar archivo "${archivo.name}":`, error);
          alert(`Error al procesar el archivo "${archivo.name}". Verifique que sea un archivo Excel válido.`);
          setProcesando(false);
          return;
        }
      }

      console.log('Valores recopilados:', {
        F23: valoresF23,
        F24: valoresF24,
        F25: valoresF25,
        F26: valoresF26,
        F27: valoresF27
      });

      // Validar que se hayan extraído valores
      if (valoresF23.length === 0) {
        alert('No se encontraron valores numéricos en las celdas F23-F27 de los archivos subidos.');
        setProcesando(false);
        return;
      }

      // Calcular promedios
      const promedioF23 = valoresF23.reduce((a, b) => a + b, 0) / valoresF23.length;
      const promedioF24 = valoresF24.reduce((a, b) => a + b, 0) / valoresF24.length;
      const promedioF25 = valoresF25.reduce((a, b) => a + b, 0) / valoresF25.length;
      const promedioF26 = valoresF26.reduce((a, b) => a + b, 0) / valoresF26.length;
      const promedioF27 = valoresF27.reduce((a, b) => a + b, 0) / valoresF27.length;

      console.log('Promedios calculados:', {
        promedioF23,
        promedioF24,
        promedioF25,
        promedioF26,
        promedioF27
      });

      // Cargar el template base
      const response = await fetch('/Formato Evaluacion.xlsx');
      if (!response.ok) {
        throw new Error('No se encontró el archivo template');
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new Error('No se encontró la hoja de trabajo');
      }

      // Escribir los promedios redondeados a 1 decimal
      worksheet.getCell('F23').value = Math.round(promedioF23 * 10) / 10;
      worksheet.getCell('F24').value = Math.round(promedioF24 * 10) / 10;
      worksheet.getCell('F25').value = Math.round(promedioF25 * 10) / 10;
      worksheet.getCell('F26').value = Math.round(promedioF26 * 10) / 10;
      worksheet.getCell('F27').value = Math.round(promedioF27 * 10) / 10;

      // Escribir todos los valores de A30 concatenados con saltos de línea
      if (valoresA30.length > 0) {
        worksheet.getCell('A30').value = valoresA30.join('\n');
        // Habilitar text wrap para que se vean los saltos de línea
        worksheet.getCell('A30').alignment = { wrapText: true, vertical: 'top' };
      }

      // Escribir todos los valores de E30 concatenados con saltos de línea
      if (valoresE30.length > 0) {
        worksheet.getCell('E30').value = valoresE30.join('\n');
        // Habilitar text wrap para que se vean los saltos de línea
        worksheet.getCell('E30').alignment = { wrapText: true, vertical: 'top' };
      }

      // Escribir todos los valores de A36 (observaciones) concatenados con saltos de línea
      if (valoresA36.length > 0) {
        worksheet.getCell('A36').value = valoresA36.join('\n');
        // Habilitar text wrap para que se vean los saltos de línea
        worksheet.getCell('A36').alignment = { wrapText: true, vertical: 'top' };
      }

      // Copiar valores del primer archivo al resultado
      if (datosDelPrimerArchivo.C4 !== undefined) worksheet.getCell('C4').value = datosDelPrimerArchivo.C4;
      if (datosDelPrimerArchivo.A6 !== undefined) worksheet.getCell('A6').value = datosDelPrimerArchivo.A6;
      if (datosDelPrimerArchivo.A8 !== undefined) worksheet.getCell('A8').value = datosDelPrimerArchivo.A8;
      if (datosDelPrimerArchivo.E8 !== undefined) worksheet.getCell('E8').value = datosDelPrimerArchivo.E8;
      if (datosDelPrimerArchivo.G8 !== undefined) worksheet.getCell('G8').value = datosDelPrimerArchivo.G8;
      if (datosDelPrimerArchivo.A10 !== undefined) worksheet.getCell('A10').value = datosDelPrimerArchivo.A10;
      if (datosDelPrimerArchivo.A14 !== undefined) worksheet.getCell('A14').value = datosDelPrimerArchivo.A14;
      if (datosDelPrimerArchivo.E14 !== undefined) worksheet.getCell('E14').value = datosDelPrimerArchivo.E14;
      if (datosDelPrimerArchivo.A16 !== undefined) worksheet.getCell('A16').value = datosDelPrimerArchivo.A16;
      if (datosDelPrimerArchivo.E16 !== undefined) worksheet.getCell('E16').value = datosDelPrimerArchivo.E16;
      if (datosDelPrimerArchivo.G16 !== undefined) worksheet.getCell('G16').value = datosDelPrimerArchivo.G16;
      if (datosDelPrimerArchivo.D18 !== undefined) worksheet.getCell('D18').value = datosDelPrimerArchivo.D18;
      if (datosDelPrimerArchivo.G18 !== undefined) worksheet.getCell('G18').value = datosDelPrimerArchivo.G18;
      if (datosDelPrimerArchivo.D19 !== undefined) worksheet.getCell('D19').value = datosDelPrimerArchivo.D19;
      if (datosDelPrimerArchivo.G19 !== undefined) worksheet.getCell('G19').value = datosDelPrimerArchivo.G19;

      // Escribir fecha actual en I4 en formato largo español
      const fechaActual = new Date();
      const opciones: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opciones);
      worksheet.getCell('I4').value = fechaFormateada;

      // Generar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fecha = new Date().toISOString().split('T')[0];
      link.download = `Evaluacion_Final_Promedio_${fecha}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      alert(`Evaluación final generada exitosamente con el promedio de ${archivosSubidos.length} archivos.`);
      
      // Limpiar archivos subidos después de generar
      setArchivosSubidos([]);
    } catch (error) {
      console.error('Error al generar evaluación final:', error);
      alert('Error al generar la evaluación final. Revise la consola para más detalles.');
    } finally {
      setProcesando(false);
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
    if (!formData.fechaPrestacion) {
      setError('La fecha de prestación es requerida');
      return false;
    }
    if (!formData.fechaEvaluacion) {
      setError('La fecha de evaluación es requerida');
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
    if (!formData.cumplimientoEspecificaciones) {
      setError('Debe calificar el cumplimiento de especificaciones');
      return false;
    }
    if (!formData.habilidadesConocimientos) {
      setError('Debe calificar las habilidades y conocimientos');
      return false;
    }
    if (!formData.oportunidadEntrega) {
      setError('Debe calificar la oportunidad en tiempos de entrega');
      return false;
    }
    if (!formData.oportunidadRespuesta) {
      setError('Debe calificar la oportunidad de respuesta');
      return false;
    }
    if (!formData.calidadProducto) {
      setError('Debe calificar la calidad del producto/servicio');
      return false;
    }
    if (!formData.nombreSeleccionador.trim()) {
      setError('El nombre de quien selecciona es requerido');
      return false;
    }
    if (!formData.cargoSeleccionador.trim()) {
      setError('El cargo es requerido');
      return false;
    }
    return true;
  };

  const calcularPuntajeTotal = (): number => {
    const porcentajes = {
      cumplimientoEspecificaciones: 0.20,  // 20%
      habilidadesConocimientos: 0.20,       // 20%
      oportunidadEntrega: 0.20,             // 20%
      oportunidadRespuesta: 0.20,           // 20%
      calidadProducto: 0.20,                // 20%
    };

    const puntaje = (
      parseInt(formData.cumplimientoEspecificaciones || '0') * porcentajes.cumplimientoEspecificaciones +
      parseInt(formData.habilidadesConocimientos || '0') * porcentajes.habilidadesConocimientos +
      parseInt(formData.oportunidadEntrega || '0') * porcentajes.oportunidadEntrega +
      parseInt(formData.oportunidadRespuesta || '0') * porcentajes.oportunidadRespuesta +
      parseInt(formData.calidadProducto || '0') * porcentajes.calidadProducto
    );

    return Math.round(puntaje * 100) / 100;
  };

  const descargarFormatoEvaluacion = async () => {
    try {
      const response = await fetch('/Formato Evaluacion.xlsx');
      
      if (!response.ok) {
        throw new Error('No se encontró el archivo "Formato Evaluacion.xlsx" en la carpeta public');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      const worksheet = workbook.worksheets[0];
      
      if (!worksheet) {
        throw new Error('No se encontró la hoja de trabajo');
      }
      
      // Formatear fechas en formato largo español
      const fechaPrest = new Date(formData.fechaPrestacion + 'T00:00:00');
      const fechaEval = new Date(formData.fechaEvaluacion + 'T00:00:00');
      const opciones: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const fechaPrestFormateada = fechaPrest.toLocaleDateString('es-ES', opciones);
      const fechaEvalFormateada = fechaEval.toLocaleDateString('es-ES', opciones);
      
      // Llenar las celdas
      worksheet.getCell('C4').value = fechaPrestFormateada;
      worksheet.getCell('I4').value = fechaEvalFormateada;
      worksheet.getCell('A6').value = formData.nombreRazonSocial;
      worksheet.getCell('A8').value = formData.direccion;
      worksheet.getCell('E8').value = formData.ciudad;
      worksheet.getCell('G8').value = formData.nit;
      worksheet.getCell('A10').value = formData.bienServicio;
      
      // Datos de contacto
      worksheet.getCell('A14').value = formData.nombreContacto;
      worksheet.getCell('E14').value = formData.cargoContacto;
      worksheet.getCell('A16').value = formData.correoContacto;
      worksheet.getCell('E16').value = formData.celularContacto;
      worksheet.getCell('G16').value = formData.telefonoContacto;
      
      // Tipo de proveedor
      if (formData.tipoProveedor === 'Persona Natural') {
        worksheet.getCell('D18').value = 'X';
      } else if (formData.tipoProveedor === 'Persona Jurídica') {
        worksheet.getCell('G18').value = 'X';
      }
      
      // Tipo (Servicio/Producto)
      if (formData.tipo === 'Servicio') {
        worksheet.getCell('D19').value = 'X';
      } else if (formData.tipo === 'Producto') {
        worksheet.getCell('G19').value = 'X';
      }
      
      // Criterios de evaluación (F23 a F27)
      worksheet.getCell('F23').value = parseInt(formData.cumplimientoEspecificaciones || '0');
      worksheet.getCell('F24').value = parseInt(formData.habilidadesConocimientos || '0');
      worksheet.getCell('F25').value = parseInt(formData.oportunidadEntrega || '0');
      worksheet.getCell('F26').value = parseInt(formData.oportunidadRespuesta || '0');
      worksheet.getCell('F27').value = parseInt(formData.calidadProducto || '0');
      
      // Datos de quien selecciona
      worksheet.getCell('A30').value = formData.nombreSeleccionador;
      worksheet.getCell('E30').value = formData.cargoSeleccionador;
      
      // Observaciones
      worksheet.getCell('A36').value = formData.observaciones;
      
      // Generar buffer del Excel
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Convertir buffer a Base64 usando Blob y FileReader
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Nombre del archivo: Evaluacion_NombreProveedor_NombreEvaluador_Fecha.xlsx
      const nombreProveedor = formData.nombreRazonSocial.replace(/\s+/g, '_');
      const nombreEvaluador = formData.nombreSeleccionador.replace(/\s+/g, '_');
      const nombreArchivo = `Evaluacion_${nombreProveedor}_${nombreEvaluador}_${formData.fechaEvaluacion}.xlsx`;

      // Guardar en OneDrive vía Power Automate
      const resultado = await powerAutomateService.guardarExcelEnOneDrive({
        nombreArchivo: nombreArchivo,
        contenidoBase64: base64,
        carpetaDestino: 'Evaluaciones'
      });

      if (resultado.success) {
        alert(`Evaluación guardada exitosamente en OneDrive.\n\nArchivo: ${nombreArchivo}`);
      } else {
        throw new Error(resultado.error || 'Error al guardar en OneDrive');
      }
    } catch (error) {
      console.error('Error al guardar evaluación:', error);
      alert('Error al guardar la evaluación en OneDrive. Revise la consola para más detalles.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    const puntaje = calcularPuntajeTotal();
    setPuntajeTotal(puntaje);
    setAprueba(puntaje >= 1.75);
    setMostrarResultados(true);
  };

  if (mostrarResultados) {
    return (
      <div className="form-container">
        <div className="form-header">
          <h1>Resultado de la Evaluación</h1>
        </div>

        <div className="form-content">
          <div className="form-section">
            <h2>Proveedor Evaluado</h2>
            <div style={{
              padding: '1.5rem',
              border: '2px solid #1e3a8a',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              marginBottom: '2rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a8a' }}>
                {formData.nombreRazonSocial}
              </h3>
              <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>NIT: {formData.nit}</p>
              <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                Bien/Servicio: {formData.bienServicio}
              </p>
            </div>

            <div style={{
              padding: '2rem',
              backgroundColor: aprueba ? '#f0fdf4' : '#fef2f2',
              border: `3px solid ${aprueba ? '#10b981' : '#ef4444'}`,
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: aprueba ? '#10b981' : '#ef4444',
                marginBottom: '1rem'
              }}>
                {puntajeTotal.toFixed(2)}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                {aprueba ? '✅ APROBADO' : '❌ NO APROBADO'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {aprueba 
                  ? 'El proveedor cumple con los criterios de evaluación (≥1.75)' 
                  : 'El proveedor no cumple con los criterios mínimos (<1.75)'}
              </div>
            </div>

            <button
              type="button"
              onClick={descargarFormatoEvaluacion}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '1rem'
              }}
            >
              ☁️ Guardar en OneDrive
            </button>
          </div>

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

  if (registroExitoso) {
    return (
      <div className="form-container">
        <div className="form-header">
          <h1>Evaluación de Proveedores</h1>
        </div>

        <div className="form-content">
          <div className="form-section">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>¡Evaluación registrada exitosamente!</h2>
              <p>Los datos han sido guardados correctamente.</p>
              <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitOld = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setEnviando(true);

    try {
      const response = await powerAutomateService.submitFormulario4(formData);

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
      fechaPrestacion: '',
      fechaEvaluacion: '',
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
      cumplimientoEspecificaciones: '',
      habilidadesConocimientos: '',
      oportunidadEntrega: '',
      oportunidadRespuesta: '',
      calidadProducto: '',
      observaciones: '',
    });
  };

  if (registroExitoso) {
    return (
      <div className="success-screen">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h1>¡Evaluación Registrada Exitosamente!</h1>
          <p>Los datos de evaluación han sido guardados correctamente.</p>
          
          <div className="success-actions">
            <button onClick={registrarOtro} className="btn btn-primary">
              Registrar Otra Evaluación
            </button>
            <Link to="/" className="btn btn-secondary">
              Volver al Menú Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si no ha seleccionado opción, mostrar selector
  if (!opcionSeleccionada) {
    return (
      <div className="form-container">
        <div className="form-header">
          <button className="btn-back" onClick={() => window.location.href = '/'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
          <h1>Evaluación de Proveedores</h1>
          <p className="form-description">Seleccione el tipo de evaluación que desea realizar</p>
        </div>

        <div className="form-content">
          <div className="evaluacion-options">
            {opciones.map((opcion) => (
              <div
                key={opcion.id}
                className="evaluacion-option-card"
                onClick={() => seleccionarOpcion(opcion.id)}
              >
                <div className="evaluacion-icon">
                  {opcion.id === 'formulario' ? (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                      <path d="M12 18v-6" />
                      <path d="m9 15 3 3 3-3" />
                    </svg>
                  )}
                </div>
                <h3>{opcion.nombre}</h3>
                <p>{opcion.id === 'formulario' ? 'Completar formulario de evaluación' : 'Subir informe de evaluación'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Si seleccionó informe, mostrar área de carga de archivos
  if (opcionSeleccionada === 'informe') {
    return (
      <div className="form-container animated-content">
        <div className="form-header">
          <button className="btn-back" onClick={() => setOpcionSeleccionada('')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
          <h1>Informe de Evaluación</h1>
          <p className="form-description">Suba el informe de evaluación del proveedor</p>
        </div>

        <div className="form-content">
          <div className="form-section">
            <h2>Cargar Archivo</h2>
            
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#1e3a8a';
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = '#f8fafc';
              const files = e.dataTransfer.files;
              if (files) {
                const nuevosArchivos = Array.from(files).filter(
                  file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
                );
                setArchivosSubidos([...archivosSubidos, ...nuevosArchivos]);
              }
            }}>
              <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                accept=".xls,.xlsx"
                multiple
                onChange={handleArchivosChange}
              />
              <div style={{ marginBottom: '1rem' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ margin: '0 auto' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
                Arrastra y suelta tus archivos Excel aquí
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                o
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                Seleccionar Archivos
              </button>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '1rem' }}>
                Archivos Excel (.xls, .xlsx) - Puedes seleccionar varios archivos
              </p>
            </div>

            {/* Lista de archivos subidos */}
            {archivosSubidos.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.125rem' }}>
                  Archivos Cargados ({archivosSubidos.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {archivosSubidos.map((archivo, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        <span style={{ color: '#334155', fontWeight: '500' }}>{archivo.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarArchivo(index)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#fee2e2',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#fecaca';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                        }}
                        title="Eliminar archivo"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Botón Generar Evaluación Final */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={generarEvaluacionFinal}
                    disabled={archivosSubidos.length === 0 || procesando}
                    style={{
                      padding: '1rem 2rem',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#fff',
                      backgroundColor: archivosSubidos.length === 0 || procesando ? '#94a3b8' : '#1e3a8a',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: archivosSubidos.length === 0 || procesando ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      if (archivosSubidos.length > 0 && !procesando) {
                        e.currentTarget.style.backgroundColor = '#1e40af';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.3)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (archivosSubidos.length > 0 && !procesando) {
                        e.currentTarget.style.backgroundColor = '#1e3a8a';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {procesando ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" opacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Generar Evaluación Final
                      </>
                    )}
                  </button>
                  <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>
                    Se generará un promedio de los {archivosSubidos.length} archivo{archivosSubidos.length !== 1 ? 's' : ''} cargado{archivosSubidos.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Nueva sección para generar carta de evaluación */}
          <div className="form-section" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
              Generar Carta de Evaluación
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Sube el archivo Excel de evaluación final para generar la carta de evaluación del proveedor
            </p>

            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              marginBottom: '1.5rem'
            }}>
              <input
                type="file"
                id="informeFileInput"
                style={{ display: 'none' }}
                accept=".xls,.xlsx"
                onChange={handleArchivoInformeChange}
              />
              {!archivoInforme ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ margin: '0 auto' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => document.getElementById('informeFileInput')?.click()}
                  >
                    Seleccionar Excel de Evaluación
                  </button>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                    Sube el archivo Excel generado anteriormente
                  </p>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, color: '#334155', fontWeight: '500' }}>{archivoInforme.name}</p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                      {(archivoInforme.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArchivoInforme(null)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#fee2e2',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    title="Eliminar archivo"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {archivoInforme && (
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={generarCartaEvaluacion}
                  disabled={procesandoCarta}
                  style={{
                    padding: '0.875rem 1.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#fff',
                    backgroundColor: procesandoCarta ? '#94a3b8' : '#059669',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: procesandoCarta ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    if (!procesandoCarta) {
                      e.currentTarget.style.backgroundColor = '#047857';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!procesandoCarta) {
                      e.currentTarget.style.backgroundColor = '#059669';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {procesandoCarta ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
                      </svg>
                      Generando...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="11" x2="12" y2="17" />
                        <polyline points="9 14 12 17 15 14" />
                      </svg>
                      Generar Carta de Evaluación
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              onClick={() => {
                setOpcionSeleccionada('');
                setArchivosSubidos([]);
              }} 
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <Link to="/" className="btn btn-primary">
              Volver al Menú
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si seleccionó formulario, mostrar el formulario actual
  return (
    <div className="form-container animated-content">
      <div className="form-header">
        <button className="btn-back" onClick={() => setOpcionSeleccionada('')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        <h1>Formulario de Evaluación de Proveedores</h1>
        <p className="form-description">Complete la información de evaluación del proveedor</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-section">
          <h2>Datos de Quien Evalúa</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombreSeleccionador">
                Nombre de quien evalúa <span className="required">*</span>
              </label>
              <select
                id="nombreSeleccionador"
                name="nombreSeleccionador"
                value={evaluadorSeleccionado}
                onChange={handleEvaluadorChange}
                className="form-input"
                disabled={cargandoClientes}
                required
              >
                <option value="">
                  {cargandoClientes ? 'Cargando evaluadores...' : 'Seleccione el evaluador'}
                </option>
                {evaluadores.map((evaluador) => (
                  <option key={evaluador} value={evaluador}>
                    {evaluador}
                  </option>
                ))}
              </select>
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
                placeholder="Cargo del evaluador"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Información General</h2>
          
          <div className="form-group">
            <label htmlFor="fechaPrestacion">Fecha de prestación o suministro del primer bien o servicio *</label>
            <input
              type="date"
              id="fechaPrestacion"
              name="fechaPrestacion"
              value={formData.fechaPrestacion}
              onChange={handleInputChange}
              className="form-input"
              required
            />
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

          <div className="form-group">
            <label htmlFor="proveedorSeleccionado">
              Seleccionar Proveedor <span className="required">*</span>
            </label>
            <select
              id="proveedorSeleccionado"
              onChange={handleClienteChange}
              className="form-input"
              disabled={!evaluadorSeleccionado || cargandoClientes}
            >
              <option value="">
                {!evaluadorSeleccionado 
                  ? 'Primero seleccione el evaluador' 
                  : cargandoClientes 
                    ? 'Cargando proveedores...' 
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
            <label htmlFor="nombreRazonSocial">Nombre o razón social *</label>
            <input
              type="text"
              id="nombreRazonSocial"
              name="nombreRazonSocial"
              value={formData.nombreRazonSocial}
              onChange={handleInputChange}
              className="form-input"
              required
              readOnly
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
                readOnly
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
                readOnly
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
                readOnly
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
                readOnly
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
            <label htmlFor="cumplimientoEspecificaciones">Cumplimiento especificaciones contractuales o negociación inicial *</label>
            <select
              id="cumplimientoEspecificaciones"
              name="cumplimientoEspecificaciones"
              value={formData.cumplimientoEspecificaciones}
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
            <label htmlFor="habilidadesConocimientos">Habilidades y conocimientos técnicos *</label>
            <select
              id="habilidadesConocimientos"
              name="habilidadesConocimientos"
              value={formData.habilidadesConocimientos}
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
            <label htmlFor="oportunidadEntrega">Oportunidad en los tiempos de entrega *</label>
            <select
              id="oportunidadEntrega"
              name="oportunidadEntrega"
              value={formData.oportunidadEntrega}
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
            <label htmlFor="oportunidadRespuesta">Oportunidad de respuesta en quejas/reclamos/ayudas/inquietudes *</label>
            <select
              id="oportunidadRespuesta"
              name="oportunidadRespuesta"
              value={formData.oportunidadRespuesta}
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
            <label htmlFor="calidadProducto">Calidad del producto/servicio en uso *</label>
            <select
              id="calidadProducto"
              name="calidadProducto"
              value={formData.calidadProducto}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="3">Excelente calidad</option>
              <option value="2">Calidad regular</option>
              <option value="1">Mala calidad</option>
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
              placeholder="Ingrese observaciones adicionales sobre la evaluación..."
            />
          </div>
        </div>

        <div className="form-actions">
          <Link to="/" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary">
            Calcular Evaluación
          </button>
        </div>
      </form>
    </div>
  );
};

export default Formulario4;
