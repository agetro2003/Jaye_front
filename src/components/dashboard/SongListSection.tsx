import { useMemo, useState } from 'react';
import { Music, Loader2 } from 'lucide-react';
import SongRow from '../ui/SongRow';
import { useRecentSongs } from '../../hooks/useRecentSongs';
import EditSongModal from '../song/EditSongModal';
import api from '../../api/axios';
import { getApiError } from '../../utils/errorHandler';
import DeleteModal from '../ui/DeleteModal';

// 1. Definimos las props que recibimos del Dashboard
interface SongListProps {
  searchTerm: string;
  sortOption: string;
}

export default function SongListSection({ searchTerm, sortOption }: SongListProps) {
  const { recentSongs, isLoading, refetchRecentSongs } = useRecentSongs(5);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<{ id: number, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formatDate = (isoString: string) => { /* Tu lógica actual */ 
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatTime = (isoString: string) => { /* Tu lógica actual */ 
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredAndSortedSongs = useMemo(() => {
    // A. Filtrar por texto
    const result = recentSongs.filter((song) => 
      
      song.song_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

// B. Ordenar
    result.sort((a, b) => {
      if (sortOption === "recent-edit") {
        // Miramos la última actualización (si no hay, usamos la creación)
        const dateA = new Date(a.song_last_update || a.song_created_at).getTime();
        const dateB = new Date(b.song_last_update || b.song_created_at).getTime();
        return dateB - dateA;
      }
      
      if (sortOption === "recent-create") {
        // Miramos ESTRICTAMENTE la fecha de creación original
        const dateA = new Date(a.song_created_at).getTime();
        const dateB = new Date(b.song_created_at).getTime();
        return dateB - dateA;
      }

      if (sortOption === "name-asc") return a.song_title.localeCompare(b.song_title);
      if (sortOption === "name-desc") return b.song_title.localeCompare(a.song_title);
      
      return 0;
    });

    return result;
  }, [recentSongs, searchTerm, sortOption]);

  const handleDeleteClick = (id: number) => { /* Tu lógica actual */ 
    const song = recentSongs.find(s => s.song_id === id);
    if (song) {
      setSongToDelete({ id, name: song.song_title });
      setIsDeleteModalOpen(true);
    }
  };
  const handleEditClick = (id: number) => { /* Tu lógica actual */ 
    setSongToEdit(id);
    setIsEditModalOpen(true);
  };
  const handleEditSuccess = () => { refetchRecentSongs(); };
  const handleConfirmDelete = async () => { /* Tu lógica actual */ 
    if (!songToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/songs/${songToDelete.id}`);
      refetchRecentSongs();
      setIsDeleteModalOpen(false);
      setSongToDelete(null);
    } catch (error) {
      alert(getApiError(error, "Error al eliminar la canción"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 pl-1">
        <Music className="w-5 h-5 text-slate-700" />
        <h2 className="text-lg font-bold text-slate-800">Canciones editadas recientemente</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-4 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            <span className="ml-2 text-slate-500 font-medium">Cargando composiciones...</span>
          </div>
        ) : recentSongs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium">
            No tienes canciones recientes. ¡Crea una nueva composición!
          </div>
        ) : filteredAndSortedSongs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium">
            No se encontraron composiciones con "{searchTerm}"
          </div>
        ) : (
          filteredAndSortedSongs.map((song) => {
            const dateStr = song.song_last_update || song.song_created_at;
            return (
              <SongRow
                key={song.song_id}
                id={song.song_id}
                name={song.song_title}
                folderName={song.song_songwriter} 
                lastModified={formatDate(dateStr)}
                time={formatTime(dateStr)}
                onEdit={handleEditClick}  
                onDelete={handleDeleteClick}  
              />
            );
          })
        )}
      </div>

      <EditSongModal isOpen={isEditModalOpen} songId={songToEdit} onClose={() => setIsEditModalOpen(false)} onSuccess={handleEditSuccess} />
      <DeleteModal 
        isOpen={isDeleteModalOpen} 
        title="Eliminar composición" 
        message={<p>¿Estás seguro de que deseas eliminar la composición <span className="font-bold text-slate-800">"{songToDelete?.name}"</span>? Esta acción es permanente.</p>} 
        isDeleting={isDeleting} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
      />
    </div>
  );
}