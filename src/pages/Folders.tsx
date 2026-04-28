import {  useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Folder } from 'lucide-react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/Dashboard/SearchBar';
import FolderCard from '../components/ui/FolderCard';
import {EditFolderModal, DeleteFolderModal} from '../components/folder/FolderModals';
import { useFolders } from '../hooks/useFolders';


const PALETTE = [
  'bg-[#b93838]', 'bg-[#2da431]', 'bg-[#3734a9]', 'bg-[#af9e26]', 'bg-[#a5326b]',
];

export default function Folders() {

  const { folders, isLoading, error, updateFolderLocally, removeFolderLocally } = useFolders();

  // Estados visuales mínimos para abrir/cerrar modales
  const [editModal, setEditModal] = useState({ isOpen: false, id: null as number | null, name: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as number | null });
 return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-10">
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8b5cf6] mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Folder className="w-8 h-8 text-slate-800" />
          <h1 className="text-3xl font-bold text-slate-900">Todas tus carpetas</h1>
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
                onEditClick={(id, name) => setEditModal({ isOpen: true, id, name })}
                onDeleteClick={(id) => setDeleteModal({ isOpen: true, id })}
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
      <DeleteFolderModal 
        isOpen={deleteModal.isOpen}
        folderId={deleteModal.id}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onSuccess={removeFolderLocally}
      />
    </div>
  );
}