import { useState, useRef, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SheetMusicPlayer from '../components/editor/SheetMusicPlayer'; 
import AIProposals from '../components/editor/AIProposals';
import { handleDownloadPDF } from '../utils/downloadPDF';
import api from '../api/axios';
import abcjs from 'abcjs'; 
import axios from 'axios';
import { ArrowLeft, Save, Download, Settings, Sparkles, Loader2, Music, CheckCircle2, HelpCircle } from 'lucide-react';
import AbcHelpModal from '../components/editor/AbcHelpModal';
import { getApiError } from '../utils/errorHandler';

export default function Editor() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();

  const [abcText, setAbcText] = useState("");
  const [songTitle, setSongTitle] = useState("Cargando...");
  const [songwriter, setSongwriter] = useState("");  

  const [originalAbc, setOriginalAbc] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [instrument, setInstrument] = useState(0); 
  const [drumStyle, setDrumStyle] = useState('none');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [proposals, setProposals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numVariations, setNumVariations] = useState(3);
  const [temperature, setTemperature] = useState(1.0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);
  const previewSynthRef = useRef<InstanceType<typeof abcjs.synth.CreateSynth> | null>(null);

  const hasUnsavedChanges = abcText !== originalAbc;

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await api.get(`/songs/${songId}`);
        const song = response.data;
        
        const initialText = song.song_abc_text || `X: 1\nT: ${song.song_title}\nC: ${song.song_songwriter}\nM: 4/4\nL: 1/8\nK: C\nV: 1\n|`;
        
        setAbcText(initialText);
        setOriginalAbc(initialText);
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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("Tienes cambios sin guardar. ¿Estás seguro de que quieres salir y perderlos?");
      if (!confirmLeave) return;
    }
    navigate('/dashboard');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.put(`/songs/${songId}`, {
        song_abc_text: abcText,
        song_title: songTitle,
        song_songwriter: songwriter
      });
      
      setOriginalAbc(abcText);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (err: unknown) {
      alert(getApiError(err, "Error al guardar los cambios"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadMIDI = async () => {
    try {
      const cleanAbcForAudio = abcText.replace(/\n(?:\s*\n)+/g, '\n');
      
      const midiResult = abcjs.synth.getMidiFile(cleanAbcForAudio);
      
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
  
  const handleGenerateAI = async () => {
    if (!abcText.trim()) {
      alert("Escribe algo en el editor antes de pedir una propuesta.");
      return;
    }

    setIsGenerating(true);
    setProposals([]);

    try {
      const cleanAbcForAI = abcText.replace(/\n(?:\s*\n)+/g, '\n');

      const response = await api.post('/songs/generate-ai', {
        abcText: cleanAbcForAI,
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

      {/* px-3 en móvil, px-6 en escritorio; py reducido en móvil */}
      <main className="flex-1 max-w-350 w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-4 sm:gap-6">
        
        {/* 1. CABECERA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={handleBackClick} 
              className="p-2 text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 rounded-xl shrink-0"
              title="Volver al panel"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {/* truncate para que un título largo no rompa el layout en móvil */}
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{songTitle}</h1>
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Cambios sin guardar"></span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">{songwriter}</p>
            </div>
          </div>

          {/* Botones de acción: se envuelven en móvil */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {saveSuccess && (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 className="w-4 h-4" /> Guardado
              </span>
            )}

            <button 
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-violet-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            
            <button 
              onClick={handleDownloadMIDI}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              title="Descargar audio MIDI"
            >
              <Music className="w-4 h-4 text-violet-500" />
              {/* En móvil solo el icono; en sm+ aparece el texto */}
              <span className="hidden sm:inline">Audio</span>
            </button>

            <button 
              onClick={() => handleDownloadPDF(printAreaRef, songTitle)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              title="Descargar partitura en PDF"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">PDF</span>
            </button>
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
            <div className="p-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 border-t border-slate-200">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instrumento</label>
                <select 
                  value={instrument} 
                  onChange={(e) => setInstrument(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 outline-none"
                >
                  <option value={0}>🎹 Piano</option>
                  <option value={24}>🎸 Guitarra</option>
                  <option value={32}>🎻 Bajo</option>
                  <option value={40}>🎻 Violín</option>
                  <option value={56}>🎺 Trompeta</option>
                  <option value={73}>🎤 Flauta</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batería</label>
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-violet-500 uppercase tracking-wider">Propuestas IA</label>
                <select 
                  value={numVariations} 
                  onChange={(e) => setNumVariations(Number(e.target.value))}
                  className="bg-violet-50 border border-violet-200 text-violet-800 text-sm font-medium rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 outline-none"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-violet-500 uppercase tracking-wider">Creatividad</label>
                <select 
                  value={temperature} 
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="bg-violet-50 border border-violet-200 text-violet-800 text-sm font-medium rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 outline-none"
                >
                  <option value={0.5}>Conservador</option>
                  <option value={1.0}>Equilibrado</option>
                  <option value={1.5}>Creativo</option>
                  <option value={2.0}>Caótico</option>
                </select>
              </div>

            </div>
          )}
        </div>

        {/* 3. ZONA DE TRABAJO
            - Móvil: columna, cada panel con altura fija mínima de 420px para que sea usable
            - Desktop (lg+): fila lado a lado con flex-1 para llenar el alto disponible
        */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          
          {/* Panel izquierdo: Editor ABC */}
          <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col p-4 sm:p-6
                          min-h-[420px] lg:min-h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-slate-900">Notación ABC</h2>
                <button 
                  onClick={() => setIsHelpModalOpen(true)}
                  className="p-1 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors"
                  title="Ayuda con la notación"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : 'text-violet-500'}`} /> 
                {isGenerating ? 'Componiendo...' : 'Propuesta IA'}
              </button>
            </div>
            {/* flex-1 hace que el textarea ocupe el resto del alto del panel */}
            <textarea
              className="flex-1 w-full bg-slate-50 border border-slate-200 text-slate-800 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 rounded-xl"
              value={abcText}
              onChange={(e) => setAbcText(e.target.value)}
            />
          </div>

          {/* Panel derecho: Partitura renderizada
              h-[420px] fijo en móvil (SheetMusicPlayer lo necesita para que
              su absolute inset-0 tenga dimensiones reales).
              En lg volvemos a flex normal y dejamos que el panel se estire. */}
          <div className="w-full lg:w-1/2 h-[420px] lg:h-auto lg:min-h-[600px]" ref={printAreaRef}>
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
      <AbcHelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
    </div>
  );
}