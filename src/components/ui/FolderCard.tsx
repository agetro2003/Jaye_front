import { Folder } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FolderCardProps {
  id: number;
  name: string;
  count: number;
  colorClass: string;
}

export default function FolderCard({ id, name, count, colorClass }: FolderCardProps) {
  return (
    // 'group' nos permite hacer efectos en los hijos cuando hacemos hover en el padre
    <Link 
    to={`/folder/${id}`}
    className="bg-white border border-slate-200 p-5 rounded-2xl hover:shadow-md cursor-pointer transition-all group block"
    >
      
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