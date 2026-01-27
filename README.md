# Sistema de Formularios Corporativos

Aplicación web corporativa para capturar información mediante formularios y almacenar datos en Excel (OneDrive) usando Power Automate.

## 🚀 Características

- ✅ Dashboard intuitivo con navegación clara
- ✅ Formulario Base para alta de clientes
- ✅ 5 formularios especializados con dropdown dinámico de clientes
- ✅ Diseño corporativo profesional y responsive
- ✅ Validaciones en frontend
- ✅ Integración con Power Automate (HTTP POST/GET)
- ✅ Mensajes de éxito/error claros
- ✅ TypeScript para mayor seguridad

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Flujos de Power Automate configurados (ver sección de configuración)

## 🛠️ Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar URLs de Power Automate**
   
   Editar el archivo `src/services/powerAutomateService.ts` y reemplazar las URLs placeholder con las URLs reales de tus flujos de Power Automate:

   ```typescript
   const config: PowerAutomateConfig = {
     baseFormUrl: 'TU_URL_AQUI',
     getClientesUrl: 'TU_URL_AQUI',
     formulario1Url: 'TU_URL_AQUI',
     // ... etc
   };
   ```

## 🚀 Ejecución

### Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Build para Producción
```bash
npm run build
```

### Preview del Build
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   └── forms/
│       ├── FormularioBase.tsx      # Alta de clientes
│       ├── FormularioBase.css
│       └── FormularioGenerico.tsx  # Componente reutilizable para formularios 1-5
├── pages/
│   ├── Dashboard.tsx               # Página principal
│   ├── Dashboard.css
│   ├── Formulario1.tsx             # Información general
│   ├── Formulario2.tsx             # Datos financieros
│   ├── Formulario3.tsx             # Documentación
│   ├── Formulario4.tsx             # Evaluación de desempeño
│   └── Formulario5.tsx             # Observaciones generales
├── services/
│   └── powerAutomateService.ts    # Servicio API para Power Automate
├── types/
│   └── index.ts                   # Definiciones TypeScript
├── utils/
│   └── validation.ts              # Utilidades de validación
├── styles/
│   └── global.css                 # Estilos globales corporativos
├── App.tsx                        # Configuración de rutas
└── main.tsx                       # Punto de entrada
```

## ⚙️ Configuración de Power Automate

### Flujos Necesarios

#### 1. Flujo GET - Obtener Clientes
- **Trigger:** "When a HTTP request is received"
- **Método:** GET
- **Acción:** "List rows present in a table" (Excel Online)
  - Tabla: "Clientes" en hoja "Base_Clientes"
- **Response:** Devolver JSON con ClienteID, NombreCliente, NIT, Estado

#### 2. Flujo POST - Alta de Clientes
- **Trigger:** "When a HTTP request is received"
- **Método:** POST
- **JSON Schema:**
  ```json
  {
    "type": "object",
    "properties": {
      "NombreCliente": { "type": "string" },
      "NIT": { "type": "string" },
      "Estado": { "type": "string" }
    }
  }
  ```
- **Acción:** "Add a row into a table" → Tabla "Clientes"

#### 3. Flujos POST - Formularios 1-5
- Similar al flujo de alta de clientes
- Cada uno apunta a su tabla correspondiente (Formulario1, Formulario2, etc.)
- Incluir ClienteID en el schema JSON

### Estructura del Excel en OneDrive

#### Hoja "Base_Clientes"
Tabla: **Clientes**
| ClienteID | NombreCliente | NIT | Estado |
|-----------|---------------|-----|--------|

#### Hojas "Formulario1", "Formulario2", etc.
Cada hoja debe tener una tabla con:
- ClienteID (relación con Base_Clientes)
- Campos específicos del formulario

## 🎨 Personalización

### Colores Corporativos
Editar variables CSS en `src/styles/global.css`:

```css
:root {
  --primary-color: #1e3a8a;      /* Azul principal */
  --primary-dark: #1e40af;       /* Azul oscuro */
  --accent-color: #0ea5e9;       /* Azul acento */
  /* ... más colores */
}
```

### Agregar/Modificar Campos de Formularios
Editar el array `campos` en cada archivo de formulario (`src/pages/Formulario1.tsx`, etc.)

## 🔒 Seguridad

- ✅ Las URLs de Power Automate incluyen tokens de seguridad
- ✅ No se exponen credenciales en el frontend
- ✅ Validaciones de datos antes del envío
- ✅ CORS configurado en Power Automate

## 📱 Responsive Design

La aplicación está optimizada para:
- 💻 Desktop (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Mobile (< 768px)

## 🐛 Troubleshooting

### Error: "No se pudieron cargar los clientes"
- Verificar que la URL de `getClientesUrl` sea correcta
- Verificar que el flujo de Power Automate esté activo
- Revisar la consola del navegador para más detalles

### Error al enviar formulario
- Verificar URLs en `powerAutomateService.ts`
- Verificar que las tablas de Excel existan
- Revisar que los nombres de columnas coincidan

## 📝 Próximos Pasos

1. Configurar flujos en Power Automate
2. Crear Excel con estructura de tablas
3. Actualizar URLs en el código
4. Probar conexión GET/POST
5. Desplegar en servidor web

## 📄 Licencia

Proyecto corporativo interno.

## 👥 Soporte

Para dudas o problemas, contactar al equipo de desarrollo.
  },
])
```
