import { useState, useEffect } from 'react';
import api from '../api/axios';

export interface ApiFolder {
  folder_id: number;
  folder_name: string;
  user_id: number;
  song_count: number;
}

export function useFolders(refreshTrigger: number = 0) {
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Cargar las carpetas
  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/folders/');
        setFolders(response.data);
      } catch (err) {
        setError('No se pudieron cargar las carpetas.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFolders();
  }, [refreshTrigger]); // Si el trigger cambia (ej. crear carpeta), vuelve a pedir los datos

  // 2. Funciones para actualizar la interfaz localmente sin recargar la página
  const updateFolderLocally = (id: number, newName: string) => {
    setFolders(prev => prev.map(f => f.folder_id === id ? { ...f, folder_name: newName } : f));
  };

  const removeFolderLocally = (id: number) => {
    setFolders(prev => prev.filter(f => f.folder_id !== id));
  };

  return { folders, isLoading, error, updateFolderLocally, removeFolderLocally };
}