import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode; // Permite pasar strings o HTML (para poner negritas)
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ 
  isOpen, 
  title, 
  message, 
  isDeleting, 
  onClose, 
  onConfirm 
}: DeleteModalProps) {
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      title={title}
      icon={<AlertTriangle className="w-6 h-6 text-rose-500" />}
    >
      <div className="space-y-6">
        <div className="text-slate-600 text-sm leading-relaxed">
          {message}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 min-w-[130px]"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}