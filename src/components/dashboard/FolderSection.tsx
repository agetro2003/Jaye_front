import { useMemo, useRef, useState } from 'react';
import { Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import FolderCard from '../ui/FolderCard';
import { EditFolderModal } from '../folder/FolderModals';
import DeleteModal from '../ui/DeleteModal';
import { useFolders } from '../../hooks/useFolders';
import api from '../../api/axios';
import { getApiError } from '../../utils/errorHandler';

const PALETTE = ['bg-[#b93838]', 'bg-[#2da431]', 'bg-[#3734a9]', 'bg-[#af9e26]', 'bg-[#a5326b]'];

// --- NUEVO: Añadimos onFolderChange ---
interface FolderSectionProps {
  searchTerm: string;
  sortOption: string;
  onFolderChange?: () => void;
}

export default function FolderSection({ searchTerm, sortOption, onFolderChange }: FolderSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { folders, isLoading, error, updateFolderLocally, removeFolderLocally } = useFolders();
  
  const [editModal, setEditModal] = useState({ isOpen: false, id: null as number | null, name: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as number | null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); if (!scrollRef.current) return; setStartX(e.pageX - scrollRef.current.offsetLeft); setScrollLeft(scrollRef.current.scrollLeft); };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging || !scrollRef.current) return; e.preventDefault(); const x = e.pageX - scrollRef.current.offsetLeft; const walk = (x - startX) * 1.5; scrollRef.current.scrollLeft = scrollLeft - walk; };

  const filteredAndSortedFolders = useMemo(() => {
    const result = folders.filter((folder) => folder.folder_name.toLowerCase().includes(searchTerm.toLowerCase()));
    result.sort((a, b) => {
      if (sortOption === "name-asc") return a.folder_name.localeCompare(b.folder_name);
      if (sortOption === "name-desc") return b.folder_name.localeCompare(a.folder_name);
      return 0; 
    });
    return result;
  }, [folders, searchTerm, sortOption]);

  const handleConfirmDelete = async () => { 
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/folders/${deleteModal.id}`);
      removeFolderLocally(deleteModal.id); 
      setDeleteModal({ isOpen: false, id: null, name: '' }); 
      
      // --- NUEVO: Avisamos al padre tras borrar ---
      if (onFolderChange) onFolderChange();
      
    } catch (err: unknown) {
      alert(getApiError(err, 'Error al eliminar la carpeta'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Carpetas</h2>
        </div>
        <Link to="/folders" className="text-sm font-bold text-[#8b5cf6] hover:text-[#7c3aed] transition-colors">
         Ver todas
        </Link>
      </div>

      {isLoading && <p className="text-slate-500 text-sm pl-1">Cargando tus carpetas...</p>}
      {error && <p className="text-rose-500 text-sm pl-1">{error}</p>}
      {!isLoading && !error && folders.length === 0 && (
        <p className="text-slate-500 text-sm pl-1">Aún no tienes carpetas. ¡Crea la primera!</p>
      )}
      {!isLoading && folders.length > 0 && filteredAndSortedFolders.length === 0 && (
        <p className="text-slate-500 text-sm pl-1">No se encontraron carpetas con "{searchTerm}"</p>
      )}

      {!isLoading && filteredAndSortedFolders.length > 0 && (
        <div 
          ref={scrollRef} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
          className="flex flex-nowrap gap-5 overflow-x-auto pb-4 pt-1 px-1 cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {filteredAndSortedFolders.map((folder, index) => {
            const color = PALETTE[index % PALETTE.length];
            return (
              <div key={folder.folder_id} className="w-[220px] sm:w-[240px] shrink-0">
                <FolderCard
                  id={folder.folder_id} 
                  name={folder.folder_name}
                  count={folder.song_count} 
                  colorClass={color}
                  onEditClick={(id, name) => setEditModal({ isOpen: true, id, name })} 
                  onDeleteClick={(id, name) => setDeleteModal({ isOpen: true, id, name })} 
                />
              </div>
            );
          })}

          <EditFolderModal 
            key={editModal.id} 
            isOpen={editModal.isOpen} 
            folderId={editModal.id} 
            initialName={editModal.name} 
            onClose={() => setEditModal({ ...editModal, isOpen: false })} 
            onSuccess={(id, name) => {
              updateFolderLocally(id, name);
              // --- NUEVO: Avisamos al padre tras editar ---
              if (onFolderChange) onFolderChange();
            }} 
          />
          
          <DeleteModal isOpen={deleteModal.isOpen} title="Eliminar carpeta" message={<p>¿Estás seguro de que deseas eliminar la carpeta <span className="font-bold text-slate-800">"{deleteModal.name}"</span>? Esta acción borrará permanentemente la carpeta y todas las canciones dentro.</p>} isDeleting={isDeleting} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={handleConfirmDelete} />
        </div>
      )}
    </div>
  );
}