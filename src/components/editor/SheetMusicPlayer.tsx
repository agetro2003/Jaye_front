import { useRef } from 'react';
import { Play, Square } from 'lucide-react';
import { useAbcAudio } from '../../hooks/useAbcAudio';

interface SheetMusicPlayerProps {
  abcText: string;
  instrument?: number;
  drumStyle?: string;
}

export default function SheetMusicPlayer({ 
  abcText, 
  instrument = 0,
  drumStyle = 'none' 
}: SheetMusicPlayerProps) {
  
  const paperRef = useRef<HTMLDivElement>(null);
  const { togglePlay, isPlaying } = useAbcAudio(paperRef, abcText, instrument, drumStyle);

  return (
    /*
      En móvil: altura fija de 420px para que el SVG de abcjs tenga espacio real.
      En lg (escritorio): h-full para llenar la altura del panel lateral.
      
      El truco: en móvil NO usamos h-full porque el padre no tiene altura definida
      en px, solo min-h, lo que hace que flex-1 colapse a 0. Con h-[420px] el
      contenedor tiene dimensiones reales y el absolute inset-0 funciona.
    */
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col
                    h-[420px] lg:h-full">
      
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-base sm:text-xl font-bold text-slate-900">Partitura</h2>
        
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 text-rose-500 fill-rose-500" />
              Detener
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-slate-700" />
              Reproducir
            </>
          )}
        </button>
      </div>

      {/* Contenedor del pentagrama: ocupa el resto de la tarjeta */}
      <div className="flex-1 min-h-0 relative rounded-xl bg-[#fafafa] border border-slate-100">
        <div className="absolute inset-0 overflow-auto p-4">
          <div ref={paperRef} className="sheet" />
        </div>
      </div>
      
    </div>
  );
}