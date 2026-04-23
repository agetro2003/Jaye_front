import { useRef, useState } from 'react';
import { Folder } from 'lucide-react';
import FolderCard from '../ui/FolderCard';

const MOCK_FOLDERS = [
  { id: 1, name: 'Nombre de la carpeta', count: 12 },
  { id: 2, name: 'Banda Sonora TFM', count: 8 },
  { id: 3, name: 'Ideas Orquestales', count: 24 },
  { id: 4, name: 'Borradores', count: 3 },
  { id: 5, name: 'Proyectos 2026', count: 15 },
  { id: 6, name: 'Música para Películas', count: 9 }, 
];

const PALETTE = [
  'bg-[#b93838]', 'bg-[#2da431]', 'bg-[#3734a9]', 'bg-[#af9e26]', 'bg-[#a5326b]',
];

export default function FolderSection() {
  // 1. Referencia al contenedor que vamos a scrollear
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 2. Estados para saber dónde hizo clic el usuario y si está arrastrando
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 3. Funciones que simulan el arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (!scrollRef.current) return;
    // Guardamos la posición inicial del clic
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false); // Si el ratón sale del área, soltamos
  };

  const handleMouseUp = () => {
    setIsDragging(false); // Al soltar el clic, terminamos de arrastrar
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault(); // Evita que el navegador seleccione texto por accidente
    
    // Calculamos cuánto se ha movido el ratón
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // El 1.5 es la velocidad (puedes subirlo a 2 si lo quieres más rápido)
    
    // Movemos el scroll
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="mb-10">
      
      {/* Título y Botón */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Carpetas</h2>
        </div>
        <button className="text-sm font-bold text-[#8b5cf6] hover:text-[#7c3aed] transition-colors">
          Ver todas
        </button>
      </div>

      {/* CONTENEDOR CON EVENTOS DE RATÓN */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        // Añadimos cursor-grab para que salga la manito
        className="flex flex-nowrap gap-5 overflow-x-auto pb-4 pt-1 px-1 cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {MOCK_FOLDERS.map((folder, index) => {
          const color = PALETTE[index % PALETTE.length];
          return (
            <div key={folder.id} className="w-[220px] sm:w-[240px] shrink-0">
              <FolderCard
                name={folder.name}
                count={folder.count}
                colorClass={color}
              />
            </div>
          );
        })}
      </div>
      
    </div>
  );
}