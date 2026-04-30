import { Music, Clock, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface SongRowProps {
  id: number;
  name: string;
  folderName: string; // O el nombre del autor, según prefieras
  lastModified: string;
  time: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function SongRow({ id, name, folderName, lastModified, time, onEdit, onDelete }: SongRowProps) {
  const navigate = useNavigate();

  // Al hacer clic en la fila, vamos al editor
  const handleRowClick = () => {
    navigate(`/editor/${id}`);
  };

  return (
    <div 
      onClick={handleRowClick}
      className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg group cursor-pointer"
    >
      
      {/* LADO IZQUIERDO: Icono y Textos */}
      <div className="flex items-center gap-4">
        <div className="bg-[#242c3d] w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
          <Music className="text-white w-5 h-5" />
        </div>
        
        <div>
          <h3 className="font-bold text-slate-800 text-[15px]">{name}</h3>
          <p className="text-xs font-medium text-slate-500">{folderName}</p>
        </div>
      </div>

      {/* LADO DERECHO: Fecha y Acciones */}
      <div className="flex items-center gap-8">
        
        <div className="hidden sm:flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <div className="text-right">
            <p className="text-xs font-bold text-slate-700">Ultima modificación</p>
            <p className="text-[11px] font-medium text-slate-500">{time} de {lastModified}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3 text-slate-400">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit?.(id); }}
            className="hover:text-violet-600 transition-colors p-1.5 hover:bg-violet-50 rounded-md"
            title="Editar info"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
            className="hover:text-rose-600 transition-colors p-1.5 hover:bg-rose-50 rounded-md"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}