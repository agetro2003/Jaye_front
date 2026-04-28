import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode; // Permite pasar un icono como <FolderPlus />
  children: ReactNode; // El contenido (formulario, texto, etc.)
}

export default function Modal({ isOpen, onClose, title, icon, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Botón de cerrar (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera dinámica */}
        <div className="flex items-center gap-3 mb-6">
          {icon && (
            <div className="bg-violet-100 p-2.5 rounded-xl text-violet-600">
              {icon}
            </div>
          )}
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>

        {/* Contenido (Aquí inyectaremos el formulario o mensaje) */}
        {children}

      </div>
    </div>
  );
}