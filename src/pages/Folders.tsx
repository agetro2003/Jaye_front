import { useState, useMemo } from "react";
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
  "bg-[#b93838]", "bg-[#2da431]", "bg-[#3734a9]", "bg-[#af9e26]", "bg-[#a5326b]",
];

export default function Folders() {
  const { folders, isLoading, error, updateFolderLocally, removeFolderLocally } = useFolders();

  // 1. Estados de la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  // Estados visuales mínimos para abrir/cerrar modales
  const [editModal, setEditModal] = useState({ isOpen: false, id: null as number | null, name: "" });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as number | null, name: "" });
  const [isDeleting, setIsDeleting] = useState(false); 

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredAndSortedFolders = useMemo(() => {
    // Filtrar por texto
    const result = folders.filter((folder) => 
      folder.folder_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar (Asumiendo que tus carpetas tienen created_at/updated_at en tu base de datos)
    // Si no las tienen, puedes quitar los dos primeros 'if' y dejar solo el filtrado por nombre
    result.sort((a, b) => {

      if (sortOption === "name-asc") return a.folder_name.localeCompare(b.folder_name);
      if (sortOption === "name-desc") return b.folder_name.localeCompare(a.folder_name);
      
      return 0; 
    });

    return result;
  }, [folders, searchTerm, sortOption]);

  const handleConfirmDelete = async () => { /* ... Tu lógica actual ... */
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/folders/${deleteModal.id}`);
      removeFolderLocally(deleteModal.id); 
      setDeleteModal({ isOpen: false, id: null, name: "" }); 
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
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8b5cf6] mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Folder className="w-8 h-8 text-slate-800" />
          <h1 className="text-3xl font-bold text-slate-900">Todas tus carpetas</h1>
        </div>

        {/* 2. Conectamos el SearchBar a nuestro estado */}
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
          hideDateSorts={true} 
        />

        {/* Mismo renderizado de estados */}
        {isLoading && <p className="text-slate-500">Cargando...</p>}
        {error && <p className="text-rose-500">{error}</p>}
        
        {/* Mensaje si la búsqueda no encuentra nada */}
        {!isLoading && folders.length > 0 && filteredAndSortedFolders.length === 0 && (
           <p className="text-slate-500">No se encontraron carpetas con "{searchTerm}"</p>
        )}

        {/* 3. Mapeamos usando filteredAndSortedFolders en lugar de folders */}
        {!isLoading && filteredAndSortedFolders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredAndSortedFolders.map((folder, index) => (
              <FolderCard
                key={folder.folder_id}
                id={folder.folder_id}
                name={folder.folder_name}
                count={folder.song_count}
                colorClass={PALETTE[index % PALETTE.length]}
                onEditClick={(id, name) => setEditModal({ isOpen: true, id, name })}
                onDeleteClick={(id, name) => setDeleteModal({ isOpen: true, id, name })}
              />
            ))}
          </div>
        )}
      </main>

      <EditFolderModal key={editModal.id} isOpen={editModal.isOpen} folderId={editModal.id} initialName={editModal.name} onClose={() => setEditModal({ ...editModal, isOpen: false })} onSuccess={updateFolderLocally} />
      <DeleteModal isOpen={deleteModal.isOpen} title="Eliminar carpeta" message={<p>¿Estás seguro de que deseas eliminar la carpeta <span className="font-bold text-slate-800">"{deleteModal.name}"</span>? Esta acción borrará permanentemente la carpeta y todas las canciones dentro.</p>} isDeleting={isDeleting} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={handleConfirmDelete} />
    </div>
  );
}