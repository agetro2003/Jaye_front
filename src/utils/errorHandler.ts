import axios from 'axios';

/**
 * Extrae el mensaje de error de una respuesta de Axios o devuelve un mensaje por defecto.
 */
export const getApiError = (error: unknown, defaultMessage = "Ocurrió un error inesperado."): string => {
  if (axios.isAxiosError(error)) {
    // Si es un error de Axios, intentamos leer el "detail" que manda FastAPI
    return error.response?.data?.detail || defaultMessage;
  }
  
  if (error instanceof Error) {
    // Si es un error nativo de JavaScript (ej. fallo de red)
    return error.message;
  }
  
  // Si es un error rarísimo que no sabemos qué es
  return defaultMessage;
};