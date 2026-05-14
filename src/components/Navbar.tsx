import { Music, User, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; // <-- Añadimos Link aquí

export default function Navbar() {
  const navigate = useNavigate();

  // Función para salir
  const handleLogout = () => {
    localStorage.removeItem('token'); // Borramos el token
    navigate('/'); // Lo mandamos al login
  };

  return (
    <nav className="bg-[#242c3d] text-white px-6 py-4 flex items-center justify-between shadow-md">
      
      {/* Lado izquierdo: Logo y Nombre */}
      <div className="flex items-center gap-3">
        <Music className="w-6 h-6 text-white" />
        <span className="text-xl font-bold tracking-wide">Jaye</span>
      </div>

      {/* Lado derecho: Perfil y Cerrar Sesión */}
      <div className="flex items-center gap-12 text-sm font-medium">
        
        {/* Usamos Link en lugar de button, pero con TUS clases exactas */}
        <Link 
          to="/profile" 
          className="flex items-center gap-2 hover:text-violet-400 transition-colors"
        >
          <User className="w-4 h-4" />
          <span>Mi perfil</span>
        </Link>
        
        <button 
          className="flex items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors" 
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}