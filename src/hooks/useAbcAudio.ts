import { useEffect, useRef, useState, type RefObject } from 'react';
import abcjs from 'abcjs';
import type { AbcVisualParams, TuneObject, NoteTimingEvent, MidiBuffer, TimingCallbacks} from 'abcjs';
import 'abcjs/abcjs-audio.css';
import CursorControl from '../utils/cursorControl';
import { getDrumTrack } from '../utils/drumPatterns';

const updateInstrumentInABC = (text: string, programNumber: number) => {
  const midiLine = `%%MIDI program ${programNumber}`;
  if (text.includes("%%MIDI program")) return text.replace(/%%MIDI program \d+/, midiLine);
  return text.replace(/K:[^\n]+/, (match) => `${match}\n${midiLine}`);
};

export function useAbcAudio(
  paperRef: RefObject<HTMLDivElement | null>,
  rawAbc: string,
  instrument: number,
  drumStyle: string
) {
  const synthRef = useRef<MidiBuffer| null>(null);
  const visualObjRef = useRef<TuneObject | null>(null);
  const timingCallbacksRef = useRef<TimingCallbacks | null>(null);
  const cursorControlRef = useRef<CursorControl>(new CursorControl());
  
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!paperRef.current || !rawAbc.trim()) return;

    const currentCursorControl = cursorControlRef.current;
    const cleanAbc = rawAbc.trim(); 
    const drumTrack = getDrumTrack(cleanAbc, drumStyle);
    
    const abcWithDrums = drumStyle === 'none' ? cleanAbc : `${cleanAbc}\n${drumTrack}`;
    const finalAbc = updateInstrumentInABC(abcWithDrums, instrument);
    
    try {
      const visualOptions: AbcVisualParams = { 
        responsive: "resize", 
        scale: 0.9, 
        add_classes: true 
      };
      
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

    return () => {
      if (synthRef.current) synthRef.current.stop();
      if (timingCallbacksRef.current) timingCallbacksRef.current.stop();
      currentCursorControl.onFinished(); 
      setIsPlaying(false);
    };
  }, [rawAbc, instrument, drumStyle, paperRef]);

  // Función de parada (la separamos para poder llamarla desde dentro del play)
  const stop = () => {
    if (synthRef.current) synthRef.current.stop();
    if (timingCallbacksRef.current) timingCallbacksRef.current.stop();
    cursorControlRef.current.onFinished();
    setIsPlaying(false);
  };
const play = async () => {
    const synth = synthRef.current;
    const visualObj = visualObjRef.current;
    
    if (!synth || !visualObj) return;

    await synth.prime();
    
    const timingCallbacks = new abcjs.TimingCallbacks(visualObj, {
      eventCallback: (ev: NoteTimingEvent | null) => {
        // 1. Movemos el cursor (tu lógica actual)
        cursorControlRef.current.onEvent(ev);
        
        // --- 2. EL NUEVO TRUCO ---
        // Si 'ev' es null, significa que abcjs ha llegado al final de la partitura
        if (ev === null) {
          setIsPlaying(false); // Reseteamos el botón a "Reproducir"
          // (No hace falta llamar a synth.stop() porque ya se paró solo)
        }
        
        return undefined; 
      }
    });
    
    timingCallbacksRef.current = timingCallbacks;

    // Arrancamos el audio de forma normal, sin promesas que enfaden a TypeScript
    synth.start();
    timingCallbacks.start();
    setIsPlaying(true);
  };

  const togglePlay = () => isPlaying ? stop() : play();

  return { togglePlay, isPlaying };
}