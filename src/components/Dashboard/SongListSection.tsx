import { Music } from 'lucide-react';
import SongRow from '../ui/SongRow';

// Datos falsos para probar la lista
const MOCK_SONGS = [
  { id: 1, name: 'Sinfonía del Bosque', folder: 'Banda Sonora TFM', date: '12/03/2026', time: '5:30' },
  { id: 2, name: 'Idea Melodía Principal', folder: 'Borradores', date: '10/03/2026', time: '14:15' },
  { id: 3, name: 'Tema del Villano', folder: 'Música para Películas', date: '08/03/2026', time: '9:45' },
  { id: 4, name: 'Arreglo Cuerdas', folder: 'Ideas Orquestales', date: '01/03/2026', time: '18:20' },
];

export default function SongListSection() {
  return (
    <div>
      {/* Título de la sección */}
      <div className="flex items-center gap-2 mb-4 pl-1">
        <Music className="w-5 h-5 text-slate-700" />
        <h2 className="text-lg font-bold text-slate-800">Canciones editadas recientemente</h2>
      </div>

      {/* El contenedor blanco (la tarjeta grande) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-4 shadow-sm">
        
        {/* Renderizamos la lista */}
        {MOCK_SONGS.map((song) => (
          <SongRow
            key={song.id}
            name={song.name}
            folderName={song.folder}
            lastModified={song.date}
            time={song.time}
          />
        ))}

        {/* Mensaje por si la lista estuviera vacía (buena práctica UX) */}
        {MOCK_SONGS.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            No tienes canciones recientes. ¡Crea una nueva composición!
          </div>
        )}

      </div>
    </div>
  );
}