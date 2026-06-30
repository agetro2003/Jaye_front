import { Music, User, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-[#242c3d] text-white px-4 sm:px-6 py-4 flex items-center justify-between shadow-md">
      
      {/* Lado izquierdo: Logo y Nombre */}
      <div className="flex items-center gap-3">
        <Music className="w-6 h-6 text-white" />
        <span className="text-xl font-bold tracking-wide">Jaye</span>
      </div>

      {/* Lado derecho: Perfil y Cerrar Sesión */}
      {/* gap-4 en móvil, gap-12 en escritorio */}
      <div className="flex items-center gap-4 sm:gap-12 text-sm font-medium">
        
        <Link 
          to="/profile" 
          className="flex items-center gap-2 hover:text-violet-400 transition-colors"
          title="Mi perfil"
        >
          <User className="w-5 h-5 sm:w-4 sm:h-4" />
          {/* El texto se oculta en móvil */}
          <span className="hidden sm:inline">Mi perfil</span>
        </Link>
        
        <button 
          className="flex items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors" 
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
          {/* El texto se oculta en móvil */}
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}