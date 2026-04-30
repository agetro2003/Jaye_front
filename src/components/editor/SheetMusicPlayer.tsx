import { useRef } from 'react';
import { Play, Square } from 'lucide-react';
import { useAbcAudio } from '../../hooks/useAbcAudio'; // Nuestro nuevo cerebro

interface SheetMusicPlayerProps {
  abcText: string;
  instrument?: number;
  drumStyle?: string;
}

export default function SheetMusicPlayer({ 
  abcText, 
  instrument = 0, // Por defecto: Piano
  drumStyle = 'none' 
}: SheetMusicPlayerProps) {
  
  // La caja blanca donde abcjs va a pintar
  const paperRef = useRef<HTMLDivElement>(null);

  // Le conectamos el cerebro pasándole la referencia y los datos
  const { togglePlay, isPlaying } = useAbcAudio(paperRef, abcText, instrument, drumStyle);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      
      {/* Cabecera de la Tarjeta */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Partitura</h2>
        
        {/* Botón Reproducir / Detener */}
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

      {/* Contenedor del Pentagrama */}
      {/* Usamos flex-1 para que ocupe todo el espacio sobrante hacia abajo y overflow-auto por si es muy larga */}
      <div className="flex-1 overflow-auto rounded-xl bg-[#fafafa] border border-slate-100 p-4">
        <div ref={paperRef} className="min-w-[600px] sheet"></div>
      </div>
      
    </div>
  );
}