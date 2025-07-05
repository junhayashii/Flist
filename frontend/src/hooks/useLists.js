import { useState, useEffect, useCallback } from "react";
import {
  fetchLists,
  createList,
  deleteList as apiDeleteList,
  updateListTitle as apiUpdateListTitle,
} from "../api/lists";
import { fetchTasks } from "../api/blocks";

export default function useLists(selectedListId, setSelectedListId) {
  const [lists, setLists] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to recalculate task counts
  const recalculateTaskCounts = useCallback(async () => {
    try {
      const tasks = await fetchTasks();
      const counts = {};
      tasks.forEach(task => {
        if (task.type === "task") { // Only count uncompleted tasks
          const listId = task.list;
          counts[listId] = (counts[listId] || 0) + 1;
        }
      });
      setTaskCounts(counts);
    } catch (err) {
      console.error("Error recalculating task counts:", err);
    }
  }, []);

  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      const [data, tasks] = await Promise.all([
        fetchLists(),
        fetchTasks()
      ]);
      setLists(data);
      
      // Calculate task counts for each list
      const counts = {};
      tasks.forEach(task => {
        if (task.type === "task") { // Only count uncompleted tasks
          const listId = task.list;
          counts[listId] = (counts[listId] || 0) + 1;
        }
      });
      setTaskCounts(counts);
      
      if (data.length > 0 && !selectedListId) {
        setSelectedListId(data[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedListId, setSelectedListId]);

  useEffect(() => {
    loadLists();

    // Add event listeners for real-time task count updates
    const handleTaskUpdated = () => {
      recalculateTaskCounts();
    };

    const handleTaskCreated = () => {
      recalculateTaskCounts();
    };

    const handleTaskDeleted = () => {
      recalculateTaskCounts();
    };

    // Add event listener for real-time list updates
    const handleListUpdated = (event) => {
      const updatedList = event.detail;
      setLists(prev => prev.map(list => 
        list.id === updatedList.id ? { ...list, ...updatedList } : list
      ));
    };

    window.addEventListener('taskUpdated', handleTaskUpdated);
    window.addEventListener('taskCreated', handleTaskCreated);
    window.addEventListener('taskDeleted', handleTaskDeleted);
    window.addEventListener('listUpdated', handleListUpdated);

    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdated);
      window.removeEventListener('taskCreated', handleTaskCreated);
      window.removeEventListener('taskDeleted', handleTaskDeleted);
      window.removeEventListener('listUpdated', handleListUpdated);
    };
  }, [loadLists, recalculateTaskCounts]);

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

  const getTaskCount = (listId) => {
    return taskCounts[listId] || 0;
  };

  return {
    lists,
    taskCounts,
    getTaskCount,
    loading,
    error,
    addList,
    deleteList,
    updateList,
    refreshLists: loadLists,
  };
}
