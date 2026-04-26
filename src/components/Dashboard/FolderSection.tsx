import { useEffect, useRef, useState } from 'react';
import { Folder } from 'lucide-react';
import FolderCard from '../ui/FolderCard';
import { Link } from 'react-router-dom';
import api from '../../api/axios';


interface ApiFolder {
  folder_id: number;
  folder_name: string;
  user_id: number;
  song_count: number;
}

const PALETTE = [
  'bg-[#b93838]', 'bg-[#2da431]', 'bg-[#3734a9]', 'bg-[#af9e26]', 'bg-[#a5326b]',
];

export default function FolderSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
// Estados de la API
  const [folders, setFolders] = useState<ApiFolder[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');


//Estados del scroll
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);


  //Efecto del API
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await api.get('/folders/');
        // Guardamos los datos reales en el estado
        setFolders(response.data);
      } catch (err) {
        console.error("Error cargando carpetas:", err);
        setError('No se pudieron cargar las carpetas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, []);

  // Funciones que simulan el arrastre
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
        {/* ANTES: <button className="text-sm font-bold text-[#8b5cf6]...">Ver todas</button> */}

      <Link 
      to="/folders" 
      className="text-sm font-bold text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
      >
       Ver todas
      </Link>
      </div>
      {/* ZONA DE ESTADOS (Cargando, Error, Vacío) */}
      {isLoading && <p className="text-slate-500 text-sm pl-1">Cargando tus carpetas...</p>}
      {error && <p className="text-rose-500 text-sm pl-1">{error}</p>}
      {!isLoading && !error && folders.length === 0 && (
        <p className="text-slate-500 text-sm pl-1">Aún no tienes carpetas. ¡Crea la primera!</p>
      )}

      {/* CONTENEDOR CON EVENTOS DE RATÓN */}
      {!isLoading && folders.length > 0 && (
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex flex-nowrap gap-5 overflow-x-auto pb-4 pt-1 px-1 cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {folders.map((folder, index) => {
            const color = PALETTE[index % PALETTE.length];
            return (
              <div key={folder.folder_id} className="w-[220px] sm:w-[240px] shrink-0">
                <FolderCard
                  id={folder.folder_id} // Recuerda que le añadimos el id a las props del FolderCard
                  name={folder.folder_name}
                  count={folder.song_count} // Aquí usamos el campo real de SQLAlchemy
                  colorClass={color}
                />
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
}