import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export default function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, message, isLoading = false 
}: ConfirmModalProps) {
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      icon={<AlertTriangle className="w-6 h-6 text-rose-500" />} // Icono rojo de alerta
    >
      <div className="space-y-5">
        <p className="text-slate-600 text-sm leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <div className="w-32">
            <Button 
              type="button" 
              onClick={onConfirm}
              // Si tuvieras una variante "danger" en tu Button, la pondrías aquí
            >
              {isLoading ? 'Borrando...' : 'Sí, eliminar'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}