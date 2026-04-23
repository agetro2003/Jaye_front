import { FolderPlus, Music } from 'lucide-react';
import IconButton from '../ui/IconButton';

export default function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      
      {/* Lado izquierdo: Textos */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Mis composiciones
        </h1>
        <p className="text-slate-500 font-medium">
          Organiza y crea tu música
        </p>
      </div>

      {/* Lado derecho: Botones */}
      <div className="flex items-center gap-3">
        <IconButton 
          icon={FolderPlus} 
          text="Nueva carpeta" 
          variant="secondary" 
        />
        <IconButton 
          icon={Music} 
          text="Nueva composición" 
          variant="primary" 
        />
      </div>

    </div>
  );
}