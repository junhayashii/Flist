import { useState, useEffect } from "react";
import {
  fetchLists,
  createList,
  deleteList as apiDeleteList,
  updateListTitle as apiUpdateListTitle,
} from "../api/lists";

export default function useLists(selectedListId, setSelectedListId) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      const data = await fetchLists();
      setLists(data);
      if (data.length > 0 && !selectedListId) {
        setSelectedListId(data[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addList = async (title, folderId = null) => {
    try {
      const newList = await createList(title, folderId);
      setLists(prev => [...prev, newList]);
      setSelectedListId(newList.id);
      return newList.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteList = async (id) => {
    try {
      await apiDeleteList(id);
      if (id === selectedListId) {
        setSelectedListId(null);
      }
      await loadLists();
    } catch (error) {
      console.error("リスト削除エラー:", error);
      throw error;
    }
  };

  const updateList = async (id, data) => {
    try {
      const updated = await apiUpdateListTitle(id, data);
      setLists(prev =>
        prev.map(list => (list.id === id ? { ...list, ...updated } : list))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    lists,
    loading,
    error,
    addList,
    deleteList,
    updateList,
    refreshLists: loadLists,
  };
}
