import { Music, Loader2 } from 'lucide-react';
import SongRow from '../ui/SongRow';
import { useRecentSongs } from '../../hooks/useRecentSongs';
import { useState } from 'react';
import EditSongModal from '../song/EditSongModal';
import api from '../../api/axios';
import { getApiError } from '../../utils/errorHandler';
import DeleteModal from '../ui/DeleteModal';

export default function SongListSection() {
  // Pedimos las 5 canciones más recientes
  const { recentSongs, isLoading, refetchRecentSongs } = useRecentSongs(5);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<{ id: number, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Funciones para formatear la fecha de Postgres
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // --- LÓGICA DE ELIMINAR ---
const handleDeleteClick = (id: number) => {
    // Buscamos el nombre de la canción para mostrarlo en la alerta
    const song = recentSongs.find(s => s.song_id === id);
    if (song) {
      setSongToDelete({ id, name: song.song_title });
      setIsDeleteModalOpen(true);
    }
  };
  // --- LÓGICA DE EDITAR ---
  const handleEditClick = (id: number) => {
    setSongToEdit(id);
    setIsEditModalOpen(true);
  };


  const handleEditSuccess = () => {
    refetchRecentSongs(); // Refrescamos la lista para ver el nuevo título/autor
  };
const handleConfirmDelete = async () => {
    if (!songToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/songs/${songToDelete.id}`);
      refetchRecentSongs(); // Recargamos la lista
      setIsDeleteModalOpen(false); // Cerramos el modal
      setSongToDelete(null); // Limpiamos el estado
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
        ) : (
          recentSongs.map((song) => {
            const dateStr = song.song_last_update || song.song_created_at;
            return (
              <SongRow
                key={song.song_id}
                id={song.song_id}
                name={song.song_title}
                folderName={song.song_songwriter} 
                lastModified={formatDate(dateStr)}
                time={formatTime(dateStr)}
                onEdit={handleEditClick}  // <-- Conectado
                onDelete={handleDeleteClick}   // <-- Conectado
              />
            );
          })
        )}
      </div>

      {/* Renderizamos el modal fuera de la lista */}
      <EditSongModal
        isOpen={isEditModalOpen}
        songId={songToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

     <DeleteModal
  isOpen={isDeleteModalOpen}
  title="Eliminar composición"
  message={
    <p>
      ¿Estás seguro de que deseas eliminar la composición <span className="font-bold text-slate-800">"{songToDelete?.name}"</span>? Esta acción es permanente.
    </p>
  }
  isDeleting={isDeleting}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={handleConfirmDelete} // Aquí llamas a tu función que hace el api.delete('/songs/...')
/>
    </div>
  );
}