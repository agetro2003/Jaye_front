import { ChevronDown, Search } from 'lucide-react';
 
export default function SearchBar() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2.5 mb-10 shadow-sm flex flex-col md:flex-row gap-3">
      
      {/* 1. Zona del Input (Ocupa el espacio restante con flex-1) */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar carpetas o composiciones"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-slate-700 text-sm focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

     {/* 2. Zona del Select */}
      <div className="relative md:w-[220px]">
        <select 
          className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-100 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all appearance-none cursor-pointer"
          defaultValue="recent-edit"
        >
          <option value="recent-edit">Más recientes (Edición)</option>
          <option value="recent-create">Más recientes (Creación)</option>
          <option value="name-asc">Nombre (A - Z)</option>
          <option value="name-desc">Nombre (Z - A)</option>
        </select>
        
        {/* El icono de la flecha posicionado encima del select */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
}