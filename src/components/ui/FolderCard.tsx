import { Folder } from 'lucide-react';

interface FolderCardProps {
  name: string;
  count: number;
  colorClass: string;
}

export default function FolderCard({ name, count, colorClass }: FolderCardProps) {
  return (
    // 'group' nos permite hacer efectos en los hijos cuando hacemos hover en el padre
    <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:shadow-md cursor-pointer transition-all group">
      
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
      
    </div>
  );
}