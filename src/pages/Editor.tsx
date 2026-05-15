import { useState, useRef, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // <-- Añadido useNavigate
import { ArrowLeft, Save, Download, Settings, Sparkles, Loader2, Music, CheckCircle2 } from 'lucide-react'; // <-- Añadido CheckCircle2
import Navbar from '../components/Navbar';
import SheetMusicPlayer from '../components/editor/SheetMusicPlayer'; 
import AIProposals from '../components/editor/AIProposals';
import { handleDownloadPDF } from '../utils/downloadPDF';
import api from '../api/axios';
import abcjs from 'abcjs'; 
import axios from 'axios';

import { getApiError } from '../utils/errorHandler';

export default function Editor() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate(); // <-- Iniciamos navigate

  const [abcText, setAbcText] = useState("");
  const [songTitle, setSongTitle] = useState("Cargando...");
  const [songwriter, setSongwriter] = useState("");  

  // --- NUEVO: Estado para saber qué texto teníamos al guardar/cargar ---
  const [originalAbc, setOriginalAbc] = useState("");
  // --- NUEVO: Estado para mostrar el mensaje de éxito temporal ---
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Estados para la configuración general
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [instrument, setInstrument] = useState(0); 
  const [drumStyle, setDrumStyle] = useState('none');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Estados para la IA
  const [proposals, setProposals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numVariations, setNumVariations] = useState(3);
  const [temperature, setTemperature] = useState(1.0);
  
  // Referencias
  const printAreaRef = useRef<HTMLDivElement>(null);
  const previewSynthRef = useRef<InstanceType<typeof abcjs.synth.CreateSynth> | null>(null);

  // NUEVO: Variable calculada para saber si hay cambios sin guardar
  const hasUnsavedChanges = abcText !== originalAbc;

  // EFECTO: Cargar la canción al entrar
  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await api.get(`/songs/${songId}`);
        const song = response.data;
        
        const initialText = song.song_abc_text || `X: 1\nT: ${song.song_title}\nC: ${song.song_songwriter}\nM: 4/4\nL: 1/8\nK: C\nV: 1\n|`;
        
        setAbcText(initialText);
        setOriginalAbc(initialText); // <-- Guardamos la versión original
        setSongTitle(song.song_title);
        setSongwriter(song.song_songwriter);
      } catch (err: unknown) {
        alert(getApiError(err, "No se pudo cargar la canción"));
      } finally {
        setIsLoading(false);
      }
    };

    if (songId) fetchSong();
  }, [songId]);

  // --- NUEVO: EFECTO para bloquear el cierre de pestaña/navegador ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Requerido por Chrome para mostrar la alerta
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // --- NUEVO: FUNCIÓN para interceptar el botón de "Volver al panel" ---
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("Tienes cambios sin guardar. ¿Estás seguro de que quieres salir y perderlos?");
      if (!confirmLeave) return;
    }
    navigate('/dashboard');
  };

  // FUNCIÓN: Guardar cambios en la DB
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false); // Reiniciamos el toast por si acaso
    try {
      await api.put(`/songs/${songId}`, {
        song_abc_text: abcText,
        song_title: songTitle,
        song_songwriter: songwriter
      });
      
      setOriginalAbc(abcText); // <-- Actualizamos la versión original
      setSaveSuccess(true); // Mostramos éxito
      
      // Ocultamos el mensaje verde después de 3 segundos
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (err: unknown) {
      alert(getApiError(err, "Error al guardar los cambios"));
    } finally {
      setIsSaving(false);
    }
  };

  // Descargar midi
const handleDownloadMIDI = async () => {
    try {
      // Limpiamos los "Enters" extra para que el audio no se corte por la mitad
      const cleanAbcForAudio = abcText.replace(/\n(?:\s*\n)+/g, '\n');
      
      const midiResult = abcjs.synth.getMidiFile(cleanAbcForAudio); // <-- Usamos la variable limpia
      
      const temp = document.createElement("div");
      temp.innerHTML = Array.isArray(midiResult) ? midiResult[0] : midiResult as string;
      const midiHref = temp.querySelector("a")?.getAttribute("href");
      
      if (!midiHref) {
        alert("La partitura está vacía o es inválida.");
        return;
      }

      const response = await fetch(midiHref);
      const arrayBuffer = await response.arrayBuffer();
      const midiBytes = new Uint8Array(arrayBuffer);

      const midiBlob = new Blob([midiBytes], { type: "audio/midi" });
      const url = window.URL.createObjectURL(midiBlob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${songTitle.replace(/\s+/g, '_')}.mid`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error("Error procesando MIDI:", err);
      alert("Hubo un error al generar el archivo de audio MIDI.");
    }
  };
  
  // LÓGICA DE LA IA
  const handleGenerateAI = async () => {
    if (!abcText.trim()) {
      alert("Escribe algo en el editor antes de pedir una propuesta.");
      return;
    }

    setIsGenerating(true);
    setProposals([]);

    try {
      const response = await api.post('/songs/generate-ai', {
        abcText: abcText,
        bars: 4, 
        num_variations: numVariations,
        temperature: temperature      
      });

      if (response.data && response.data.proposals) {
        setProposals(response.data.proposals);
      }
    } catch (error: unknown) {
      console.error("Error llamando a la IA:", error);
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.detail || "Hubo un error de conexión con la IA.";
        alert(`Error de IA: ${errorMsg}`);
      } else {
        alert("Hubo un error inesperado de conexión con la IA.");
      } 
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptProposal = (proposal: string) => {
    setAbcText(prev => `${prev.trim()}\n${proposal}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayProposal = async (proposal: string) => {
    if (previewSynthRef.current) {
      previewSynthRef.current.stop();
    }

    try {
      const headers = abcText.split('\n').filter(line => /^[A-Z%]:/.test(line)).join('\n');
      const previewAbc = `${headers}\n${proposal}`;

      const dummyDiv = document.createElement('div');
      // Filtramos %%newpage también en la previsualización por si acaso
      const cleanAbc = previewAbc.replace(/%%newpage/g, ''); 
      const visualObj = abcjs.renderAbc(dummyDiv, cleanAbc)[0];

      const synth = new abcjs.synth.CreateSynth();
      previewSynthRef.current = synth;

      await synth.init({
        visualObj: visualObj,
        options: { soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/" }
      });
      await synth.prime();
      synth.start();
    } catch(e) {
      console.error("Error reproduciendo la propuesta:", e);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
        <p className="mt-4 text-slate-600 font-medium">Abriendo partitura...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-350 w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* 1. CABECERA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            {/* NUEVO: Botón convertido para interceptar el clic */}
            <button 
              onClick={handleBackClick} 
              className="p-2 text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 rounded-xl"
              title="Volver al panel"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{songTitle}</h1>
                {/* NUEVO: Indicador de cambios sin guardar */}
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Cambios sin guardar"></span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">{songwriter}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
           <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            
            {/* NUEVO: Toast de éxito */}
            {saveSuccess && (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 className="w-4 h-4" /> Guardado
              </span>
            )}

            <button 
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges} // Deshabilitamos si no hay cambios
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-violet-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-violet-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            
            <button 
              onClick={handleDownloadMIDI}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              title="Descargar audio MIDI"
            >
              <Music className="w-4 h-4 text-violet-500" /> Audio
            </button>

            <button 
              onClick={() => handleDownloadPDF(printAreaRef, songTitle)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              title="Descargar partitura en PDF"
            >
              <Download className="w-4 h-4 text-slate-500" /> PDF
            </button>
          </div>
          </div>
        </div>

        {/* 2. ACORDEÓN DE CONFIGURACIÓN */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <button 
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <Settings className="w-4 h-4" /> Configuración y parámetros
            </div>
            <div className={`transform transition-transform ${isConfigOpen ? 'rotate-180' : ''}`}>▼</div>
          </button>
          
          {isConfigOpen && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-200">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instrumento</label>
                <select 
                  value={instrument} 
                  onChange={(e) => setInstrument(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 outline-none"
                >
                  <option value={0}>🎹 Piano Acústico</option>
                  <option value={24}>🎸 Guitarra Acústica</option>
                  <option value={32}>🎻 Bajo</option>
                  <option value={40}>🎻 Violín</option>
                  <option value={56}>🎺 Trompeta</option>
                  <option value={73}>🎤 Flauta</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batería (Ritmo)</label>
                <select 
                  value={drumStyle} 
                  onChange={(e) => setDrumStyle(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 outline-none"
                >
                  <option value="none">Sin Batería</option>
                  <option value="basic">Básico</option>
                  <option value="rock">Rock</option>
                  <option value="disco">Disco</option>
                  <option value="jazz">Jazz</option>
                </select>
              </div>

              {/* CONTROLES DE IA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-violet-500 uppercase tracking-wider">Opciones IA</label>
                <select 
                  value={numVariations} 
                  onChange={(e) => setNumVariations(Number(e.target.value))}
                  className="bg-violet-50 border border-violet-200 text-violet-800 text-sm font-medium rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 outline-none"
                >
                  <option value={1}>1 Propuesta</option>
                  <option value={2}>2 Propuestas</option>
                  <option value={3}>3 Propuestas</option>
                  <option value={4}>4 Propuestas</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-violet-500 uppercase tracking-wider">Creatividad (Temp)</label>
                <select 
                  value={temperature} 
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="bg-violet-50 border border-violet-200 text-violet-800 text-sm font-medium rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 outline-none"
                >
                  <option value={0.5}>Conservador (0.5)</option>
                  <option value={1.0}>Equilibrado (1.0)</option>
                  <option value={1.5}>Creativo (1.5)</option>
                  <option value={2.0}>Caótico (2.0)</option>
                </select>
              </div>

            </div>
          )}
        </div>

        {/* 3. ZONA DE TRABAJO */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-125">
          
          {/* Lado Izquierdo: Editor ABC */}
          <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Notación de ABC</h2>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : 'text-violet-500'}`} /> 
                {isGenerating ? 'Componiendo...' : 'Propuesta con IA'}
              </button>
            </div>
            <textarea
              className="flex-1 w-full bg-slate-50 border border-slate-200 text-slate-800 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 rounded-xl"
              value={abcText}
              onChange={(e) => setAbcText(e.target.value)}
            />
          </div>

          {/* Lado Derecho: Partitura */}
          <div className="w-full lg:w-1/2" ref={printAreaRef}>
            {/* 1. replace(/%%newpage/g, ''): Quita los saltos de página del PDF 
              2. replace(/\n(?:\s*\n)+/g, '\n'): Colapsa múltiples Enter seguidos en uno solo 
            */}
            <SheetMusicPlayer 
              abcText={abcText.replace(/%%newpage/g, '').replace(/\n(?:\s*\n)+/g, '\n')} 
              instrument={instrument} 
              drumStyle={drumStyle} 
            />
          </div>

        </div>

        {/* 4. ZONA DE PROPUESTAS IA */}
        <div className="mt-2">
          <AIProposals 
            proposals={proposals} 
            isLoading={isGenerating} 
            onPlayProposal={handlePlayProposal} 
            onAcceptProposal={handleAcceptProposal} 
          />
        </div>

      </main>
    </div>
  );
}