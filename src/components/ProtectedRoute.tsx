import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // Comprobamos si existe el token en el almacenamiento del navegador
  const token = localStorage.getItem('token');

  // Si no hay token, lo mandamos expulsado al Login ('/')
  // La propiedad 'replace' borra el historial para que no pueda volver atrás con la flecha del navegador
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si hay token, renderizamos el contenido hijo (el Dashboard, el Editor, etc.)
  return <Outlet />;
}