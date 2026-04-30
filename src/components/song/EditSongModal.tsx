import { useState, useEffect } from 'react';
import { Music, User, Folder as FolderIcon, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import api from '../../api/axios';
import { useFolders } from '../../hooks/useFolders';
import { getApiError } from '../../utils/errorHandler';

interface EditSongModalProps {
  isOpen: boolean;
  songId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSongModal({ isOpen, songId, onClose, onSuccess }: EditSongModalProps) {
  const [title, setTitle] = useState('');
  const [songwriter, setSongwriter] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | string>('');
  
  // Guardamos el texto ABC original para no sobreescribirlo con vacío al hacer PUT
  const [abcText, setAbcText] = useState(''); 

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  const { folders } = useFolders();

  // Cargar los datos de la canción cuando se abre el modal
  useEffect(() => {
    const fetchSongDetails = async () => {
      if (!songId || !isOpen) return;
      
      setIsFetching(true);
      setError('');
      try {
        const response = await api.get(`/songs/${songId}`);
        const song = response.data;
        setTitle(song.song_title);
        setSongwriter(song.song_songwriter);
        setSelectedFolderId(song.folder_id || '');
        setAbcText(song.song_abc_text || '');
      } catch (err: unknown) {
        setError(getApiError(err, 'Error al cargar los datos de la canción'));
      } finally {
        setIsFetching(false);
      }
    };

    fetchSongDetails();
  }, [songId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !songwriter.trim() || !selectedFolderId || !songId) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.put(`/songs/${songId}`, {
        song_title: title,
        song_songwriter: songwriter,
        folder_id: Number(selectedFolderId),
        song_abc_text: abcText // Mantenemos la partitura intacta
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getApiError(err, 'Error al actualizar la composición'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar información"
      icon={<Music className="w-6 h-6" />}
    >
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Cargando datos...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Título de la obra"
            placeholder=''
            type="text"
            icon={Music}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <InputField
            label="Compositor / Autor"
            placeholder=''
            type="text"
            icon={User}
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
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
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
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}