import { useState, useEffect } from 'react';
import { fetchFolders, createFolder, updateFolder, deleteFolder } from '../api/folders';

export default function useFolders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const data = await fetchFolders();
      setFolders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addFolder = async (title) => {
    try {
      const newFolder = await createFolder(title);
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editFolder = async (id, data) => {
    try {
      const updated = await updateFolder(id, data);
      setFolders(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeFolder = async (id) => {
    try {
      await deleteFolder(id);
      setFolders(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    folders,
    loading,
    error,
    addFolder,
    editFolder,
    removeFolder,
    refreshFolders: loadFolders
  };
} 