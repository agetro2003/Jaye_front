import type { AxiosInstance } from "axios";

export const handleGenerateAI = async (
    abcText: string,
    setProposals: React.Dispatch<React.SetStateAction<string[]>>,
    setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
    api: AxiosInstance
) => {
    // Si el editor está vacío, no hacemos nada
    if (!abcText.trim()) {
      alert("Escribe algo en el editor antes de pedir una propuesta.");
      return;
    }

    setIsGenerating(true); // Mostramos el spinner de carga
    setProposals([]); // Limpiamos propuestas anteriores

    try {
      // Hacemos el POST a tu backend
      // Ajusta la ruta si tu backend usa otra (/generate-ai, por ejemplo)
      const response = await api.post('/songs/generate-ai', {
        abcText: abcText, // Enviamos el texto actual
        bars: 4           // Puedes enviar el número de compases si tu backend lo usa
      });

      // Guardamos el array de propuestas que nos devuelve el backend
      // Asegúrate de que el backend devuelve un objeto como { proposals: ["X:1...", "X:1...", ...] }
      if (response.data && response.data.proposals) {
        setProposals(response.data.proposals);
      } else {
        alert("El backend no devolvió propuestas válidas.");
      }

    } catch (error) {
      console.error("Error llamando a la IA:", error);
      alert("Hubo un error al conectar con el servicio de IA.");
    } finally {
      setIsGenerating(false); // Ocultamos el spinner de carga
    }
  }