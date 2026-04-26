import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/Dashboard/SearchBar';
import SongRow from '../components/ui/SongRow';

// Datos falsos de las canciones DENTRO de esta carpeta
const MOCK_FOLDER_SONGS = [
  { id: 1, name: 'Intro Épica', date: '15/03/2026', time: '10:30' },
  { id: 2, name: 'Desarrollo Cuerdas', date: '14/03/2026', time: '18:45' },
  { id: 3, name: 'Clímax Final', date: '12/03/2026', time: '09:15' },
];

export default function FolderDetails() {
  // Extraemos el ID de la URL (ej: si la URL es /folder/3, id será "3")
  const { id } = useParams();

  // En una app real, usaríamos este ID para hacer una petición Axios 
  // a FastAPI y traer el nombre real de la carpeta y sus canciones.
  const folderName = `Carpeta de Proyecto ${id}`;

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        
        <Link to="/folders" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8b5cf6] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a todas las carpetas
        </Link>

        {/* Cabecera de la Carpeta */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#8b5cf6] p-2.5 rounded-xl shadow-sm">
            <FolderOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {folderName}
          </h1>
        </div>

        {/* El Buscador reutilizado */}
        <SearchBar />

        {/* La Lista de Canciones reutilizada */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-4 shadow-sm">
          {MOCK_FOLDER_SONGS.map((song) => (
            <SongRow
              key={song.id}
              name={song.name}
              folderName={folderName} // Pasamos el nombre de esta carpeta
              lastModified={song.date}
              time={song.time}
            />
          ))}

          {MOCK_FOLDER_SONGS.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              Esta carpeta está vacía. ¡Sube tu primera composición!
            </div>
          )}
        </div>

      </main>
    </div>
  );
}