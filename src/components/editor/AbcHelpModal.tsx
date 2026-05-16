import { HelpCircle, Music, Clock, Pause, Hash } from 'lucide-react';
import Modal from '../ui/Modal'; // Ajusta esta ruta si tu Modal está en otra carpeta

interface AbcHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AbcHelpModal({ isOpen, onClose }: AbcHelpModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guía rápida de Notación ABC"
      icon={<HelpCircle className="w-6 h-6" />}
    >
      {/* Añadimos scroll interno por si la pantalla del usuario es muy pequeña */}
      <div className="space-y-6 text-slate-700 text-sm max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        <p className="font-medium text-slate-600">
          La notación ABC usa letras y símbolos simples para escribir música en texto plano. Aquí tienes lo esencial para empezar a componer:
        </p>

        {/* Sección 1: Notas */}
        <div>
          <h4 className="font-bold text-violet-600 flex items-center gap-2 mb-2">
            <Music className="w-4 h-4" /> 1. Notas y Octavas
          </h4>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">C D E F G A B</code> : Notas en la octava central (Do a Si).</li>
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">c d e f g a b</code> : Una octava más aguda (minúsculas).</li>
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">C, D, E,</code> : Una octava más grave (con coma).</li>
          </ul>
        </div>

        {/* Sección 2: Duración */}
        <div>
          <h4 className="font-bold text-violet-600 flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" /> 2. Duración del sonido
          </h4>
          <p className="text-xs text-slate-500 mb-2 italic">Por defecto, una letra equivale a una corchea (1/8).</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">C2</code> : Dura el doble (una negra).</li>
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">C3</code> : Dura el triple (negra con puntillo).</li>
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">C/2</code> : Dura la mitad (una semicorchea).</li>
          </ul>
        </div>

        {/* Sección 3: Silencios */}
        <div>
          <h4 className="font-bold text-violet-600 flex items-center gap-2 mb-2">
            <Pause className="w-4 h-4" /> 3. Silencios
          </h4>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">z</code> : Silencio normal de un tiempo.</li>
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">z2</code> : Silencio del doble de duración.</li>
          </ul>
        </div>

        {/* Sección 4: Estructura */}
        <div>
          <h4 className="font-bold text-violet-600 flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4" /> 4. Compases y Acordes
          </h4>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">|</code> : Línea vertical para separar los compases.</li>
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">|:</code> y <code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">:|</code> : Inicio y fin de una repetición.</li>
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-bold border border-slate-200">[CEG]</code> : Escribir notas entre corchetes crea un acorde.</li>
          </ul>
        </div>

        <div className="bg-violet-50 p-4 rounded-xl border border-violet-100">
          <p className="text-sm text-violet-900">
            <strong>💡 Tip de la IA:</strong> No te preocupes si no lo haces perfecto. Puedes escribir un par de compases básicos y usar el botón <strong>"Propuesta con IA"</strong> para que el sistema continúe la melodía por ti.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          ¡A componer!
        </button>
      </div>
    </Modal>
  );
}