import { Link } from 'react-router-dom';
import { ArrowLeft, Folder } from 'lucide-react';
import Navbar from '../components/Navbar'; // Asumiendo que guardaste tu Navbar aquí
import SearchBar from '../components/Dashboard/SearchBar';
import FolderCard from '../components/ui/FolderCard';

// Usamos una lista un poco más larga para ver el efecto del Grid vertical
const EXTENDED_MOCK_FOLDERS = [
  { id: 1, name: 'Nombre de la carpeta', count: 12 },
  { id: 2, name: 'Banda Sonora TFM', count: 8 },
  { id: 3, name: 'Ideas Orquestales', count: 24 },
  { id: 4, name: 'Borradores', count: 3 },
  { id: 5, name: 'Proyectos 2026', count: 15 },
  { id: 6, name: 'Música para Películas', count: 9 },
  { id: 7, name: 'Piano Solos', count: 5 },
  { id: 8, name: 'Coros Épicos', count: 11 },
  { id: 9, name: 'Bases Rítmicas', count: 32 },
  { id: 10, name: 'Descartes', count: 2 },
];

const PALETTE = [
  'bg-[#b93838]', 'bg-[#2da431]', 'bg-[#3734a9]', 'bg-[#af9e26]', 'bg-[#a5326b]',
];

export default function Folders() {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      
      {/* 1. Nuestra pieza de Lego: El Navbar */}
      <Navbar />

      {/* 2. Área Principal */}
      <main className="max-w-[1200px] mx-auto px-6 py-10">
        
        {/* Botón para volver al Dashboard */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8b5cf6] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al panel
        </Link>

        {/* Cabecera de la página */}
        <div className="flex items-center gap-3 mb-8">
          <Folder className="w-8 h-8 text-slate-800" />
          <h1 className="text-3xl font-bold text-slate-900">
            Todas tus carpetas
          </h1>
        </div>

        {/* 3. Nuestra pieza de Lego: El Buscador */}
        <SearchBar />

        {/* 4. La Cuadrícula Vertical (Grid) */}
        {/* Usamos grid-cols-1 a grid-cols-5 dependiendo del tamaño de la pantalla */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {EXTENDED_MOCK_FOLDERS.map((folder, index) => {
            const color = PALETTE[index % PALETTE.length];
            return (
              <FolderCard
                key={folder.id}
                name={folder.name}
                count={folder.count}
                colorClass={color}
              />
            );
          })}
        </div>

      </main>
    </div>
  );
}