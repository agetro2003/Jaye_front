import { Music, Clock, Edit2, Trash2 } from 'lucide-react';

interface SongRowProps {
  name: string;
  folderName: string;
  lastModified: string;
  time: string;
  // En un proyecto real, aquí recibiríamos funciones onClick para editar/borrar
}

export default function SongRow({ name, folderName, lastModified, time }: SongRowProps) {
  return (
    // group nos permite detectar el hover en toda la fila
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg group">
      
      {/* LADO IZQUIERDO: Icono y Textos */}
      <div className="flex items-center gap-4">
        {/* Icono de la canción (cuadrado oscuro) */}
        <div className="bg-[#242c3d] w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
          <Music className="text-white w-5 h-5" />
        </div>
        
        {/* Nombres */}
        <div>
          <h3 className="font-bold text-slate-800 text-[15px]">{name}</h3>
          <p className="text-xs font-medium text-slate-500">{folderName}</p>
        </div>
      </div>

      {/* LADO DERECHO: Fecha y Acciones */}
      <div className="flex items-center gap-8">
        
        {/* Fecha (Oculto en móviles muy pequeños para que no se rompa) */}
        <div className="hidden sm:flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <div className="text-right">
            <p className="text-xs font-bold text-slate-700">Ultima modificación</p>
            <p className="text-[11px] font-medium text-slate-500">{time} de {lastModified}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3 text-slate-400">
          <button className="hover:text-violet-600 transition-colors p-1.5 hover:bg-violet-50 rounded-md">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="hover:text-rose-600 transition-colors p-1.5 hover:bg-rose-50 rounded-md">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}