import { useState } from 'react';
import { Folder, Pencil } from 'lucide-react';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import api from '../../api/axios';

// ==========================================
// COMPONENTE 1: MODAL DE EDICIÓN
// ==========================================
interface EditFolderModalProps {
  isOpen: boolean;
  folderId: number | null;
  initialName: string;
  onClose: () => void;
  onSuccess: (id: number, newName: string) => void;
}

export function EditFolderModal({ isOpen, folderId, initialName, onClose, onSuccess }: EditFolderModalProps) {
  // Al montar este componente, el estado se inicializa automáticamente con el prop.
  // ¡Ya no necesitamos el useEffect!
  const [editingName, setEditingName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingName.trim() || folderId === null) return;

    setIsLoading(true);
    try {
      await api.put(`/folders/${folderId}`, { folder_name: editingName });
      onSuccess(folderId, editingName);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al editar la carpeta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar carpeta" icon={<Pencil className="w-6 h-6" />}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="Nuevo nombre"
          type="text"
          placeholder="Escribe el nuevo nombre"
          icon={Folder}
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          required
        />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <div className="w-32">
            <Button type="submit">{isLoading ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// COMPONENTE 2: MODAL DE ELIMINACIÓN
// ==========================================
interface DeleteFolderModalProps {
  isOpen: boolean;
  folderId: number | null;
  onClose: () => void;
  onSuccess: (id: number) => void;
}

export function DeleteFolderModal({ isOpen, folderId, onClose, onSuccess }: DeleteFolderModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteConfirm = async () => {
    if (folderId === null) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/folders/${folderId}`);
      onSuccess(folderId);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la carpeta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDeleteConfirm}
      title="Eliminar carpeta"
      message="¿Estás seguro de que deseas eliminar esta carpeta? Esta acción borrará permanentemente la carpeta y todas las canciones dentro."
      isLoading={isLoading}
    />
  );
}