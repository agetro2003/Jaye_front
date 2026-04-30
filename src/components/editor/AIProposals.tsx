import { Play, Sparkles, Check } from 'lucide-react';

interface AIProposalsProps {
  proposals: string[];       // El array de textos ABC que nos devuelva FastAPI
  isLoading: boolean;        // Para mostrar un estado de carga
  onPlayProposal: (abc: string) => void; // Para previsualizar cómo suena
  onAcceptProposal: (abc: string) => void; // Para añadirlo al editor
}

export default function AIProposals({ proposals, isLoading, onPlayProposal, onAcceptProposal }: AIProposalsProps) {
  
  // Si no hay sugerencias y no está cargando, mostramos un pequeño "Call to Action"
  if (proposals.length === 0 && !isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center py-12">
        <div className="bg-violet-50 p-4 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-violet-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">¿Necesitas inspiración?</h3>
        <p className="text-slate-500 max-w-md text-sm">
          Haz clic en el botón "Propuesta con IA" arriba a la izquierda para generar continuaciones automáticas para tu composición actual.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-slate-800" />
        <h2 className="text-xl font-bold text-slate-900">Sugerencias generadas</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <span className="ml-3 text-slate-500 font-medium text-sm">Componiendo ideas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {proposals.map((proposal, index) => (
            <div key={index} className="flex flex-col gap-3">
              {/* Cabecera de la opción */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Opción {index + 1}</h3>
                <div className="flex gap-2">
                  {/* Botón Reproducir esta opción */}
                  <button 
                    onClick={() => onPlayProposal(proposal)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-bold transition-colors"
                  >
                    <Play className="w-3 h-3" /> Reproducir
                  </button>
                  {/* Botón Añadir al Editor */}
                  <button 
                    onClick={() => onAcceptProposal(proposal)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-xs font-bold transition-colors shadow-sm"
                    title="Añadir al editor"
                  >
                    <Check className="w-3 h-3" /> Usar
                  </button>
                </div>
              </div>

              {/* Vista del código ABC de la propuesta */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1">
                <code className="text-xs text-slate-600 font-mono whitespace-pre-wrap break-words">
                  {proposal}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}