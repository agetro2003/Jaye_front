import { Music, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  // 3. Crea la función para salir
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
          <button className="flex items-center gap-2 hover:text-violet-400 transition-colors">
            <User className="w-4 h-4" />
            <span>Mi perfil</span>
          </button>
          
          <button 
          className="flex items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors" 
          onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>
    )
}