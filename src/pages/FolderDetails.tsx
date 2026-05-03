import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FolderOpen, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/dashboard/SearchBar";
import SongRow from "../components/ui/SongRow";
import api from "../api/axios";
import { getApiError } from "../utils/errorHandler";

// Importamos los modales que ya hicimos para reutilizarlos
import EditSongModal from "../components/song/EditSongModal";
import DeleteModal from "../components/ui/DeleteModal";
import { type SongData } from "../hooks/useRecentSongs"; // Reutilizamos la interfaz

import { useFolders } from "../hooks/useFolders";

export default function FolderDetails() {
  const { id } = useParams<{ id: string }>();

  // Usamos tu hook para obtener todas las carpetas y así extraer el nombre de la actual
  const { folders } = useFolders();

  // Estados de los datos
  const [songs, setSongs] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Estados para Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Buscamos el nombre de la carpeta en cuanto las carpetas cargan
  const currentFolder = folders.find((f) => f.folder_id === Number(id));
  const folderName = currentFolder ? currentFolder.folder_name : "";

  // 2. Cargamos las canciones desde TU ruta correcta
  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    const fetchFolderData = async () => {
      if (refetchTrigger > 0 && isMounted) {
        setIsLoading(true);
      }

      try {
        // AQUÍ ESTÁ LA CORRECCIÓN: Apuntamos a tu ruta exacta
        const response = await api.get(`/folders/${id}/songs`);
        if (isMounted) {
          // Tu backend devuelve la lista directamente, así que la guardamos tal cual
          setSongs(response.data);
          setError("");
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            getApiError(err, "Error al cargar el contenido de la carpeta"),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFolderData();

    return () => {
      isMounted = false;
    };
  }, [id, refetchTrigger]);

  const handleRefetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };
  // Formateadores de fecha
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- LÓGICA DE EDITAR CANCIÓN ---
  const handleEditClick = (songId: number) => {
    setSongToEdit(songId);
    setIsEditModalOpen(true);
  };

  // --- LÓGICA DE ELIMINAR CANCIÓN ---
  const handleDeleteClick = (songId: number) => {
    const song = songs.find((s) => s.song_id === songId);
    if (song) {
      setSongToDelete({ id: songId, name: song.song_title });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!songToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/songs/${songToDelete.id}`);
      handleRefetch(); // <--- Usamos el gatillo aquí
      setIsDeleteModalOpen(false);
      setSongToDelete(null);
    } catch (err: unknown) {
      alert(getApiError(err, "Error al eliminar la canción"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Navbar />

      <main className="max-w-300 mx-auto px-6 py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8b5cf6] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al panel principal
        </Link>

        {/* Cabecera de la Carpeta */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#8b5cf6] p-2.5 rounded-xl shadow-sm">
            <FolderOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isLoading ? "Cargando..." : folderName}
          </h1>
        </div>

        <SearchBar />

        {/* Estado de Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Lista de Canciones */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-4 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <span className="ml-3 text-slate-500 font-medium">
                Abriendo carpeta...
              </span>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">
                Esta carpeta está vacía
              </p>
              <p className="text-sm">
                ¡Sube tu primera composición desde el panel principal!
              </p>
            </div>
          ) : (
            songs.map((song) => {
              const dateStr = song.song_last_update || song.song_created_at;
              return (
                <SongRow
                  key={song.song_id}
                  id={song.song_id}
                  name={song.song_title}
                  folderName={folderName} // Como estamos dentro de la carpeta, el nombre es este
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

      {/* MODALES REUTILIZADOS */}
      <EditSongModal
        isOpen={isEditModalOpen}
        songId={songToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleRefetch}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        title="Eliminar composición"
        message={
          <p>
            ¿Estás seguro de que deseas eliminar la composición{" "}
            <span className="font-bold text-slate-800">
              "{songToDelete?.name}"
            </span>
            ? Esta acción es permanente.
          </p>
        }
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
