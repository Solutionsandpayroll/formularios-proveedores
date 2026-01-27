/**
 * Utilidades para validación de formularios
 */

export const validateNIT = (nit: string): boolean => {
  // Validación básica de NIT (ajustar según requisitos específicos)
  const nitPattern = /^\d{9}-\d{1}$/;
  return nitPattern.test(nit);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phonePattern = /^\d{10}$/;
  return phonePattern.test(phone.replace(/\s/g, ''));
};

export const formatNIT = (value: string): string => {
  // Eliminar caracteres no numéricos
  const cleaned = value.replace(/\D/g, '');
  
  // Formatear como XXX-X si tiene suficientes dígitos
  if (cleaned.length >= 10) {
    return `${cleaned.substring(0, 9)}-${cleaned.substring(9, 10)}`;
  }
  
  return cleaned;
};
