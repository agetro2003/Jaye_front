import { useState, useRef, useEffect} from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Download, Settings, Sparkles, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import SheetMusicPlayer from '../components/editor/SheetMusicPlayer'; 
import AIProposals from '../components/editor/AIProposals';
import { handleDownloadPDF } from '../utils/downloadPDF';
import api from '../api/axios';
import abcjs from 'abcjs'; 
import axios from 'axios';

import { getApiError } from '../utils/errorHandler';

const INITIAL_ABC = `X: 1
T: Ejemplo de Composición
M: 4/4
L: 1/8
K: Emin
V:1
|z6 D2|"Em"EBBA B2 EB| ~B2 AB dBAG| "D"FDAD BDAD| FDAD dAFD|
"Em"EBBA B2 EB| B2 AB defg| "D"afe^c dBAF| 
"Em"DEFD E2 z2|`;

export default function Editor() {
  const { songId } = useParams<{ songId: string }>();


  const [abcText, setAbcText] = useState("");
  const [songTitle, setSongTitle] = useState("Cargando...");
  const [songwriter, setSongwriter] = useState("");  


  
  // Estados para la configuración general
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [instrument, setInstrument] = useState(0); 
  const [drumStyle, setDrumStyle] = useState('none');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // --- NUEVOS ESTADOS PARA LA IA ---
  const [proposals, setProposals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numVariations, setNumVariations] = useState(3);
  const [temperature, setTemperature] = useState(1.0);
  
  // Referencias
  const printAreaRef = useRef<HTMLDivElement>(null);
  const previewSynthRef = useRef<InstanceType<typeof abcjs.synth.CreateSynth> | null>(null);

// 2. EFECTO: Cargar la canción al entrar
  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await api.get(`/songs/${songId}`);
        const song = response.data;
        
        // Si la canción está vacía (recién creada), le ponemos una cabecera mínima
        const initialText = song.song_abc_text || `X: 1\nT: ${song.song_title}\nM: 4/4\nL: 1/8\nK: C\nV: 1\n|`;
        
        setAbcText(initialText);
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

  // 3. FUNCIÓN: Guardar cambios en la DB
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/songs/${songId}`, {
        song_abc_text: abcText,
        song_title: songTitle,
        song_songwriter: songwriter
      });
      // Podrías mostrar un "toast" de éxito aquí
    } catch (err: unknown) {
      alert(getApiError(err, "Error al guardar los cambios"));
    } finally {
      setIsSaving(false);
    }
  };


  // --- LÓGICA DE LA IA ---
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
        num_variations: numVariations, // Ahora usamos el estado
        temperature: temperature       // Ahora usamos el estado
      });

      if (response.data && response.data.proposals) {
        setProposals(response.data.proposals);
      }
    } catch (error: unknown) {
      console.error("Error llamando a la IA:", error);
      // Comprobamos si es un error de Axios para poder leer response.data
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

  // --- LÓGICA DE LOS BOTONES DE LAS PROPUESTAS ---
  const handleAcceptProposal = (proposal: string) => {
    // 1. Añadimos la propuesta al final del texto actual
    setAbcText(prev => `${prev.trim()}\n${proposal}`);
    // 2. Hacemos scroll suave hacia arriba para ver el resultado en la partitura
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 3. (Opcional) Podrías limpiar las propuestas aquí si quieres: setProposals([])
  };

  const handlePlayProposal = async (proposal: string) => {
    // Si ya hay una propuesta sonando, la detenemos
    if (previewSynthRef.current) {
      previewSynthRef.current.stop();
    }

    try {
      // Extraemos las cabeceras del texto original (X:, T:, K:, M:, L:, etc.)
      // Esto es crucial para que la propuesta suene en el tono y velocidad correctos
      const headers = abcText.split('\n').filter(line => /^[A-Z%]:/.test(line)).join('\n');
      const previewAbc = `${headers}\n${proposal}`;

      // Creamos un div invisible en memoria
      const dummyDiv = document.createElement('div');
      const visualObj = abcjs.renderAbc(dummyDiv, previewAbc)[0];

      // Inicializamos y reproducimos
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

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* 1. CABECERA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{songTitle}</h1>
              <p className="text-xs text-slate-500 font-medium">{songwriter}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-bold text-sm rounded-xl hover:bg-violet-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            <button 
              onClick={() => handleDownloadPDF(printAreaRef)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Descargar
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

              {/* --- NUEVOS CONTROLES DE IA --- */}
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
              {/* -------------------------------- */}

            </div>
          )}
        </div>

        {/* 3. ZONA DE TRABAJO */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
          
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
            <SheetMusicPlayer 
              abcText={abcText} 
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
            onPlayProposal={handlePlayProposal} // <-- Función conectada
            onAcceptProposal={handleAcceptProposal} // <-- Función conectada
          />
        </div>

      </main>
    </div>
  );
}