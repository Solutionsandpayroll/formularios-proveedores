import FormularioGenerico from '../components/forms/FormularioGenerico';

const Formulario1 = () => {
  return (
    <FormularioGenerico
      numeroFormulario={1}
      titulo="Formulario 1 - Información General"
      descripcion="Complete la información general del proveedor"
      campos={[
        {
          name: 'razonSocial',
          label: 'Razón Social',
          type: 'text',
          required: true,
          placeholder: 'Ingrese la razón social de la empresa',
        },
        {
          name: 'direccion',
          label: 'Dirección',
          type: 'text',
          required: true,
          placeholder: 'Dirección completa',
        },
        {
          name: 'telefono',
          label: 'Teléfono',
          type: 'tel',
          required: true,
          placeholder: '0000-0000',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'correo@ejemplo.com',
        },
        {
          name: 'contacto',
          label: 'Nombre del Contacto',
          type: 'text',
          required: true,
          placeholder: 'Nombre completo del contacto',
        },
        {
          name: 'observaciones',
          label: 'Observaciones',
          type: 'textarea',
          required: false,
          placeholder: 'Información adicional relevante',
        },
      ]}
    />
  );
};

export default Formulario1;
