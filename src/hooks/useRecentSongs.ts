import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export interface SongData {
  song_id: number;
  song_title: string;
  song_songwriter: string;
  folder_id: number;
  song_last_update: string;
  song_created_at: string;
}

export function useRecentSongs(limit: number = 5) {
  const [recentSongs, setRecentSongs] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Este es nuestro "gatillo" declarativo
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    // Variable de seguridad por si el usuario cambia de página muy rápido
    let isMounted = true; 

    const fetchSongs = async () => {
      // Si el trigger es mayor a 0 (es decir, el usuario le dio a recargar), mostramos el loading
      if (refetchTrigger > 0 && isMounted) {
        setIsLoading(true);
      }

      try {
        const response = await api.get(`/songs/recent?limit=${limit}`);
        // Solo guardamos si el componente sigue en pantalla
        if (isMounted) {
          setRecentSongs(response.data);
        }
      } catch (error: unknown) {
        console.error("Error cargando canciones recientes:", error);
        if (error instanceof Error) {
          console.error(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // React ejecutará esto limpiamente
    fetchSongs();

    // Función de limpieza de React
    return () => {
      isMounted = false;
    };
  }, [limit, refetchTrigger]); // El useEffect reacciona al límite o a nuestro "gatillo"

  // La función que exportamos ya NO hace el fetch directamente.
  // Solo suma +1 al gatillo. Al cambiar ese estado, React vuelve a disparar el useEffect automáticamente.
  const handleRefetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { 
    recentSongs, 
    isLoading, 
    refetchRecentSongs: handleRefetch 
  };
}