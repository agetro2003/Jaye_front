import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // <-- Añadido useNavigate
import { ArrowLeft, FolderOpen, Loader2, Music } from "lucide-react"; // <-- Añadido Music
import Navbar from "../components/Navbar";
import SearchBar from "../components/dashboard/SearchBar";
import SongRow from "../components/ui/SongRow";
import api from "../api/axios";
import { getApiError } from "../utils/errorHandler";

import EditSongModal from "../components/song/EditSongModal";
import DeleteModal from "../components/ui/DeleteModal";
import SongModal from "../components/song/SongModals"; // <-- Importamos tu SongModal
import { type SongData } from "../hooks/useRecentSongs"; 

import { useFolders } from "../hooks/useFolders";

export default function FolderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // <-- Iniciamos navigate
  const { folders } = useFolders();

  const [songs, setSongs] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Estados de la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent-edit");

  // Estados para Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<{ id: number; name: string; } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // --- NUEVO: Estado para el modal de crear canción ---
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);

  const currentFolder = folders.find((f) => f.folder_id === Number(id));
  const folderName = currentFolder ? currentFolder.folder_name : "";

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    const fetchFolderData = async () => {
      if (refetchTrigger > 0 && isMounted) setIsLoading(true);
      try {
        const response = await api.get(`/folders/${id}/songs`);
        if (isMounted) {
          setSongs(response.data);
          setError("");
        }
      } catch (err: unknown) {
        if (isMounted) setError(getApiError(err, "Error al cargar el contenido de la carpeta"));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFolderData();
    return () => { isMounted = false; };
  }, [id, refetchTrigger]);

  const handleRefetch = () => setRefetchTrigger((prev) => prev + 1);

  const formatDate = (isoString: string) => { 
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };
  const formatTime = (isoString: string) => { 
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  const filteredAndSortedSongs = useMemo(() => {
    const result = songs.filter((song) => 
      song.song_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortOption === "recent-edit") {
        const dateA = new Date(a.song_last_update || a.song_created_at).getTime();
        const dateB = new Date(b.song_last_update || b.song_created_at).getTime();
        return dateB - dateA;
      }
      
      if (sortOption === "recent-create") {
        const dateA = new Date(a.song_created_at).getTime();
        const dateB = new Date(b.song_created_at).getTime();
        return dateB - dateA;
      }

      if (sortOption === "name-asc") return a.song_title.localeCompare(b.song_title);
      if (sortOption === "name-desc") return b.song_title.localeCompare(a.song_title);
      
      return 0;
    });

    return result;
  }, [songs, searchTerm, sortOption]);

  const handleEditClick = (songId: number) => { setSongToEdit(songId); setIsEditModalOpen(true); };
  const handleDeleteClick = (songId: number) => {
    const song = songs.find((s) => s.song_id === songId);
    if (song) { setSongToDelete({ id: songId, name: song.song_title }); setIsDeleteModalOpen(true); }
  };
  const handleConfirmDelete = async () => { 
    if (!songToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/songs/${songToDelete.id}`);
      handleRefetch(); 
      setIsDeleteModalOpen(false);
      setSongToDelete(null);
    } catch (err: unknown) { alert(getApiError(err, "Error al eliminar la canción")); } 
    finally { setIsDeleting(false); }
  };

  // --- NUEVA FUNCIÓN: Manejar la creación exitosa ---
  const handleSongCreated = (songId: number) => {
    setIsSongModalOpen(false);
    navigate(`/editor/${songId}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Navbar />

      <main className="max-w-300 mx-auto px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8b5cf6] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al panel principal
        </Link>

        {/* --- CABECERA ACTUALIZADA (Layout Flex) --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#8b5cf6] p-2.5 rounded-xl shadow-sm">
              <FolderOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isLoading ? "Cargando..." : folderName}
            </h1>
          </div>
          
          <button 
            onClick={() => setIsSongModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Music className="w-4 h-4" />
            Nueva composición
          </button>
        </div>

        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-4 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <span className="ml-3 text-slate-500 font-medium">Abriendo carpeta...</span>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">Esta carpeta está vacía</p>
              <p className="text-sm">¡Añade tu primera composición con el botón superior!</p>
            </div>
          ) : filteredAndSortedSongs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">
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
                  folderName={folderName} 
                  lastModified={formatDate(dateStr)}
                  time={formatTime(dateStr)}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              );
            })
          )}
        </div>
      </main>

      <EditSongModal isOpen={isEditModalOpen} songId={songToEdit} onClose={() => setIsEditModalOpen(false)} onSuccess={handleRefetch} />
      <DeleteModal isOpen={isDeleteModalOpen} title="Eliminar composición" message={<p>¿Estás seguro de que deseas eliminar la composición <span className="font-bold text-slate-800">"{songToDelete?.name}"</span>? Esta acción es permanente.</p>} isDeleting={isDeleting} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} />
      
      {/* --- NUEVO: Modal de Crear Canción inyectando el ID de la carpeta --- */}
      <SongModal 
        isOpen={isSongModalOpen} 
        onClose={() => setIsSongModalOpen(false)} 
        onSuccess={handleSongCreated} 
        initialFolderId={Number(id)} 
      />
    </div>
  );
}