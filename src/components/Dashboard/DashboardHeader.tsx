import { useState } from 'react';
import { FolderPlus, Music, Folder } from 'lucide-react';
import IconButton from '../ui/IconButton';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import api from '../../api/axios';
import Modal from '../ui/Modal';

// Añadimos una 'prop' para avisar al padre (Dashboard) de que creamos algo
interface DashboardHeaderProps {
  onFolderCreated?: () => void;
}

export default function DashboardHeader({ onFolderCreated }: DashboardHeaderProps) {
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para enviar al Backend
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return; // Evita carpetas sin nombre

    setIsLoading(true);
    setError('');

    try {
      // Mandamos el esquema FolderCreate a FastAPI
      await api.post('/folders/', { folder_name: folderName });
      
      // Si todo va bien:
      setIsModalOpen(false); // Cerramos el modal
      setFolderName(''); // Limpiamos el input
      if (onFolderCreated) onFolderCreated(); // Avisamos al Dashboard para que recargue la lista
      
    } catch (err) {
      console.error(err);
      setError('Hubo un error al crear la carpeta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Mis composiciones</h1>
          <p className="text-slate-500 font-medium">Organiza y crea tu música</p>
        </div>

        <div className="flex items-center gap-3">
          <IconButton 
            icon={FolderPlus} 
            text="Nueva carpeta" 
            variant="secondary" 
            onClick={() => setIsModalOpen(true)} // <-- Abrimos el modal al hacer clic
          />
          <IconButton icon={Music} text="Nueva composición" variant="primary" />
        </div>
      </div>

      {/* EL MODAL (Ventana emergente) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear nueva carpeta"
        icon={<FolderPlus className="w-6 h-6" />}
      >
        <form onSubmit={handleCreateFolder} className="space-y-5">
          <InputField
            label="Nombre de la carpeta"
            type="text"
            placeholder="Ej. Banda Sonora TFM"
            icon={Folder}
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            required
          />

          {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <div className="w-32">
              <Button type="submit">
                {isLoading ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}