import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Folder } from "lucide-react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/dashboard/SearchBar";
import FolderCard from "../components/ui/FolderCard";
import { EditFolderModal } from "../components/folder/FolderModals";
import { useFolders } from "../hooks/useFolders";
import { getApiError } from "../utils/errorHandler";
import api from "../api/axios";
import DeleteModal from "../components/ui/DeleteModal";

const PALETTE = [
  "bg-[#b93838]",
  "bg-[#2da431]",
  "bg-[#3734a9]",
  "bg-[#af9e26]",
  "bg-[#a5326b]",
];

export default function Folders() {
  const {
    folders,
    isLoading,
    error,
    updateFolderLocally,
    removeFolderLocally,
  } = useFolders();

  // Estados visuales mínimos para abrir/cerrar modales
  const [editModal, setEditModal] = useState({
    isOpen: false,
    id: null as number | null,
    name: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null as number | null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false); // Estado de carga del botón rojo

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    try {
      await api.delete(`/folders/${deleteModal.id}`);
      removeFolderLocally(deleteModal.id); // Actualizamos la UI al instante
      setDeleteModal({ isOpen: false, id: null, name: "" }); // Cerramos modal
    } catch (err: unknown) {
      alert(getApiError(err, "Error al eliminar la carpeta"));
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
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8b5cf6] mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Folder className="w-8 h-8 text-slate-800" />
          <h1 className="text-3xl font-bold text-slate-900">
            Todas tus carpetas
          </h1>
        </div>

        <SearchBar />

        {/* Mismo renderizado de estados */}
        {isLoading && <p className="text-slate-500">Cargando...</p>}
        {error && <p className="text-rose-500">{error}</p>}

        {!isLoading && folders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {folders.map((folder, index) => (
              <FolderCard
                key={folder.folder_id}
                id={folder.folder_id}
                name={folder.folder_name}
                count={folder.song_count}
                colorClass={PALETTE[index % PALETTE.length]}
                onEditClick={(id, name) =>
                  setEditModal({ isOpen: true, id, name })
                }
                onDeleteClick={(id, name) =>
                  setDeleteModal({ isOpen: true, id, name })
                }
              />
            ))}
          </div>
        )}
      </main>

      <EditFolderModal
        key={editModal.id} // <--- ¡LA MAGIA! Si el ID cambia, el modal se reinicia desde cero
        isOpen={editModal.isOpen}
        folderId={editModal.id}
        initialName={editModal.name}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        onSuccess={updateFolderLocally}
      />

      {/* --- MODAL PARA ELIMINAR --- */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        title="Eliminar carpeta"
        message={
          <p>
            ¿Estás seguro de que deseas eliminar la carpeta{" "}
            <span className="font-bold text-slate-800">
              "{deleteModal.name}"
            </span>
            ? Esta acción borrará permanentemente la carpeta y todas las
            canciones dentro.
          </p>
        }
        isDeleting={isDeleting}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
