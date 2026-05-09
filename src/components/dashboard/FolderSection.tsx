import { useRef, useState } from 'react';
import { Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import FolderCard from '../ui/FolderCard';
import { EditFolderModal } from '../folder/FolderModals';
import DeleteModal from '../ui/DeleteModal'; // <-- Importamos nuestro nuevo modal universal
import { useFolders } from '../../hooks/useFolders';
import api from '../../api/axios';
import { getApiError } from '../../utils/errorHandler'; // <-- Usamos tu manejador de errores

const PALETTE = [
  'bg-[#b93838]', 'bg-[#2da431]', 'bg-[#3734a9]', 'bg-[#af9e26]', 'bg-[#a5326b]',
];

export default function FolderSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { folders, isLoading, error, updateFolderLocally, removeFolderLocally } = useFolders();
  
  // Estados visuales mínimos para abrir/cerrar modales
  const [editModal, setEditModal] = useState({ isOpen: false, id: null as number | null, name: '' });
  
  // Modificamos un poco el estado de borrado para guardar también el nombre y mostrarlo en la alerta
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as number | null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false); // Estado de carga del botón rojo

  // Estados del scroll
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Funciones que simulan el arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // --- NUEVA FUNCIÓN DE BORRADO ---
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/folders/${deleteModal.id}`);
      removeFolderLocally(deleteModal.id); // Actualizamos la UI al instante
      setDeleteModal({ isOpen: false, id: null, name: '' }); // Cerramos modal
    } catch (err: unknown) {
      alert(getApiError(err, 'Error al eliminar la carpeta'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-10">
      {/* Título y Botón */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Carpetas</h2>
        </div>
        <Link 
          to="/folders" 
          className="text-sm font-bold text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
        >
         Ver todas
        </Link>
      </div>

      {/* ZONA DE ESTADOS (Cargando, Error, Vacío) */}
      {isLoading && <p className="text-slate-500 text-sm pl-1">Cargando tus carpetas...</p>}
      {error && <p className="text-rose-500 text-sm pl-1">{error}</p>}
      {!isLoading && !error && folders.length === 0 && (
        <p className="text-slate-500 text-sm pl-1">Aún no tienes carpetas. ¡Crea la primera!</p>
      )}

      {/* CONTENEDOR CON EVENTOS DE RATÓN */}
      {!isLoading && folders.length > 0 && (
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex flex-nowrap gap-5 overflow-x-auto pb-4 pt-1 px-1 cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {folders.map((folder, index) => {
            const color = PALETTE[index % PALETTE.length];
            return (
              <div key={folder.folder_id} className="w-[220px] sm:w-[240px] shrink-0">
                <FolderCard
                  id={folder.folder_id} 
                  name={folder.folder_name}
                  count={folder.song_count} 
                  colorClass={color}
                  onEditClick={(id, name) => setEditModal({ isOpen: true, id, name })} 
                  // Ahora guardamos el ID y el Nombre para el nuevo modal
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
            onSuccess={updateFolderLocally}
          />
          
          {/* --- NUESTRO MODAL UNIVERSAL --- */}
          <DeleteModal 
            isOpen={deleteModal.isOpen}
            title="Eliminar carpeta"
            message={
              <p>
                ¿Estás seguro de que deseas eliminar la carpeta <span className="font-bold text-slate-800">"{deleteModal.name}"</span>? 
                Esta acción borrará permanentemente la carpeta y todas las canciones dentro.
              </p>
            }
            isDeleting={isDeleting}
            onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </div>
  );
}