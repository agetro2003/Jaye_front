import { useState } from 'react';
import { Music, User, Folder as FolderIcon } from 'lucide-react';
import Modal from '../ui/Modal';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import api from '../../api/axios';
import { useFolders } from '../../hooks/useFolders'; // Reutilizamos tu hook de carpetas
import { getApiError } from '../../utils/errorHandler';

interface SongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (songId: number) => void;
  initialFolderId?: number | null; // Si viene de una carpeta específica
}

export default function SongModal({ isOpen, onClose, onSuccess, initialFolderId }: SongModalProps) {
  const [title, setTitle] = useState('');
  const [songwriter, setSongwriter] = useState('');
const [selectedFolderId, setSelectedFolderId] = useState<number | string>(initialFolderId || '');  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Obtenemos las carpetas para el selector
  const { folders } = useFolders();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !songwriter.trim() || !selectedFolderId) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/songs/', {
        song_title: title,
        song_songwriter: songwriter,
        folder_id: Number(selectedFolderId),
        song_abc_text: "" // Empezamos con una canción vacía
      });

      onSuccess(response.data.song_id);
      onClose();
      // Limpiar formulario
      setTitle('');
      setSongwriter('');
    } catch (err: unknown) {
      setError(getApiError(err, 'Error al crear la composición'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva composición"
      icon={<Music className="w-6 h-6" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Título de la obra"
          icon={Music}
          type='text'
          placeholder="Ej. Sonata en Sol Menor"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <InputField
          label="Compositor / Autor"
          icon={User}
          type='text'
          placeholder="Tu nombre o nombre del grupo"
          value={songwriter}
          onChange={(e) => setSongwriter(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FolderIcon className="w-4 h-4" /> Carpeta de destino
          </label>
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            disabled={!!initialFolderId} // Deshabilitado si ya estamos en una carpeta
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
            required
          >
            <option value="" disabled>Selecciona una carpeta</option>
            {folders.map(f => (
              <option key={f.folder_id} value={f.folder_id}>
                {f.folder_name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <div className="w-32">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear obra'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}