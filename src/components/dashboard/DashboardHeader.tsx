import { useState } from 'react';
import { FolderPlus, Music, Folder } from 'lucide-react';
import IconButton from '../ui/IconButton';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import api from '../../api/axios';
import Modal from '../ui/Modal';
import SongModal from '../song/SongModals';
import { useNavigate } from 'react-router-dom';

// --- NUEVO: Añadimos refreshTrigger a las props ---
interface DashboardHeaderProps {
  onFolderCreated?: () => void;
  refreshTrigger?: number; 
}

export default function DashboardHeader({ onFolderCreated, refreshTrigger = 0 }: DashboardHeaderProps) {
  const navigate = useNavigate();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return; 

    setIsLoading(true);
    setError('');

    try {
      await api.post('/folders/', { folder_name: folderName });
      setIsFolderModalOpen(false); 
      setFolderName(''); 
      if (onFolderCreated) onFolderCreated(); // Avisamos al Dashboard
      
    } catch (err) {
      console.error(err);
      setError('Hubo un error al crear la carpeta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongCreated = (songId: number) => {
    navigate(`/editor/${songId}`);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Mis composiciones</h1>
          <p className="text-slate-500 font-medium">Organiza y crea tu música</p>
        </div>

        <div className="flex items-center gap-3">
          <IconButton icon={FolderPlus} text="Nueva carpeta" variant="secondary" onClick={() => setIsFolderModalOpen(true)} />
          <IconButton icon={Music} text="Nueva composición" variant="primary" onClick={()=>setIsSongModalOpen(true)}/>
        </div>
      </div>

      <Modal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} title="Crear nueva carpeta" icon={<FolderPlus className="w-6 h-6" />}>
        <form onSubmit={handleCreateFolder} className="space-y-5">
          <InputField label="Nombre de la carpeta" type="text" placeholder="Ej. Banda Sonora TFM" icon={Folder} value={folderName} onChange={(e) => setFolderName(e.target.value)} required />
          {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsFolderModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
            <div className="w-32"><Button type="submit">{isLoading ? 'Creando...' : 'Crear'}</Button></div>
          </div>
        </form>
      </Modal>

      {/* --- NUEVO: Usamos el refreshTrigger del Padre como Key --- */}
      <SongModal 
        key={`song-modal-${refreshTrigger}`} 
        isOpen={isSongModalOpen}
        onClose={() => setIsSongModalOpen(false)}
        onSuccess={handleSongCreated}
      />
    </>
  );
}