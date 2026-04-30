import { useEffect, useRef, useState, type RefObject } from 'react';
import abcjs from 'abcjs';
import type { AbcVisualParams, TuneObject, NoteTimingEvent, MidiBuffer, TimingCallbacks} from 'abcjs';
import 'abcjs/abcjs-audio.css';
import CursorControl from '../utils/cursorControl';
import { getDrumTrack } from '../utils/drumPatterns';

// Función rescatada para inyectar el instrumento
const updateInstrumentInABC = (text: string, programNumber: number) => {
  const midiLine = `%%MIDI program ${programNumber}`;
  if (text.includes("%%MIDI program")) return text.replace(/%%MIDI program \d+/, midiLine);
  return text.replace(/K:[^\n]+/, (match) => `${match}\n${midiLine}`);
};

export function useAbcAudio(
  paperRef: RefObject<HTMLDivElement | null>, // <-- Tipo actualizado
  rawAbc: string,
  instrument: number,
  drumStyle: string
) {
  // 1. Tipamos estrictamente las referencias usando los tipos de abcjs en lugar de 'any'
  const synthRef = useRef<MidiBuffer| null>(null);
  const visualObjRef = useRef<TuneObject | null>(null);
  const timingCallbacksRef = useRef<TimingCallbacks | null>(null);
  const cursorControlRef = useRef<CursorControl>(new CursorControl());
  
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!paperRef.current || !rawAbc.trim()) return;

    // Guardamos la referencia actual en una variable local para el Cleanup (arregla el Warning)
    const currentCursorControl = cursorControlRef.current;

    const cleanAbc = rawAbc.trim(); // <-- Crucial: elimina saltos de línea al final
    const drumTrack = getDrumTrack(cleanAbc, drumStyle);
    
    const abcWithDrums = drumStyle === 'none' ? cleanAbc : `${cleanAbc}\n${drumTrack}`;
    const finalAbc = updateInstrumentInABC(abcWithDrums, instrument);
    
    try {
      const visualOptions: AbcVisualParams = { 
        responsive: "resize", 
        scale: 0.9, 
        add_classes: true 
      };
      
      // renderAbc devuelve un array de TuneObject
      const visualObj = abcjs.renderAbc(paperRef.current, finalAbc, visualOptions)[0];
      visualObjRef.current = visualObj;

      const synth = new abcjs.synth.CreateSynth();
      synthRef.current = synth;
      
      synth.init({
        visualObj: visualObj,
        options: { soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/" }
      }).then(() => synth.prime()).catch(e => console.warn("Error al inicializar Synth:", e));

    } catch (error) {
      console.error("Error renderizando ABC:", error);
    }

    // Cleanup usando la variable local
    return () => {
      if (synthRef.current) synthRef.current.stop();
      if (timingCallbacksRef.current) timingCallbacksRef.current.stop();
      currentCursorControl.onFinished(); // <-- Usamos la variable local
      setIsPlaying(false);
    };
  }, [rawAbc, instrument, drumStyle, paperRef]);

  const play = async () => {
    const synth = synthRef.current;
    const visualObj = visualObjRef.current;
    
    if (!synth || !visualObj) return;

    await synth.prime();
    
    // 2. Tipamos el evento de NoteTimingEvent
    const timingCallbacks = new abcjs.TimingCallbacks(visualObj, {
      eventCallback: (ev: NoteTimingEvent | null) => {
        cursorControlRef.current.onEvent(ev);
        // En JS no devolver nada funciona, pero para que TypeScript 
        // no se queje por el EventCallbackReturn, devolvemos un undefined "enmascarado".
        return undefined; 
      }
    });
    
    timingCallbacksRef.current = timingCallbacks;

    synth.start();
    timingCallbacks.start();
    setIsPlaying(true);
  };

  const stop = () => {
    if (synthRef.current) synthRef.current.stop();
    if (timingCallbacksRef.current) timingCallbacksRef.current.stop();
    cursorControlRef.current.onFinished();
    setIsPlaying(false);
  };

  const togglePlay = () => isPlaying ? stop() : play();

  return { togglePlay, isPlaying };
}