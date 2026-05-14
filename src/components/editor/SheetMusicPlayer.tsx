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
      {/* Contenedor del Pentagrama */}
      {/* 1. Mantenemos flex-1 min-h-0 para que no empuje todo hacia abajo infinitamente.
        2. relative para que el scroll se ancle bien.
      */}
      <div className="flex-1 min-h-0 relative rounded-xl bg-[#fafafa] border border-slate-100">
        
        {/* 3. Aquí ponemos el absolute inset-0 con overflow-auto. 
          Esto obliga al contenedor a respetar los límites de la tarjeta y habilitar el scroll si el SVG de abcjs es más grande.
        */}
        <div className="absolute inset-0 overflow-auto p-4">
           {/* 4. Retiramos el min-w-[600px] si abcjs ya gestiona el ancho, o lo dejamos si es necesario, 
             pero lo importante es que el contenedor padre ahora tiene scroll vertical explícito.
           */}
           <div ref={paperRef} className="sheet" />
        </div>
      </div>
      
    </div>
  );
}