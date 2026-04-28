import { Folder, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FolderCardProps {
  id: number;
  name: string;
  count: number;
  colorClass: string;
  onEditClick?: (id: number, name: string) => void;
  onDeleteClick?: (id: number) => void;
}

export default function FolderCard({ id, name, count, colorClass, onEditClick, onDeleteClick }: FolderCardProps) {
  
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita navegar
    e.stopPropagation(); // Evita que el clic suba al Link
    if (onEditClick) onEditClick(id, name);
  }
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteClick) onDeleteClick(id);
  };

  return (
    // 'group' nos permite hacer efectos en los hijos cuando hacemos hover en el padre
    <Link 
    to={`/folder/${id}`}
    className="relative bg-white border border-slate-200 p-5 rounded-2xl hover:shadow-md cursor-pointer transition-all group block"
    >
      {/* Botones de editar y eliminar, solo visibles al hacer hover en la tarjeta */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button 
          onClick={handleEdit}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar nombre"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDelete}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Eliminar carpeta"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>


      {/* Icono de color */}
      <div className={`${colorClass} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Folder className="text-white w-6 h-6" />
      </div>
      
      {/* Textos */}
      <h3 className="font-bold text-slate-800 text-base truncate" title={name}>
        {name}
      </h3>
      <p className="text-xs font-medium text-slate-500 mt-1.5">
        {count} composiciones
      </p>
      
    </Link>
  );
}