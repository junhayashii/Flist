import { useState, useEffect } from "react";
import {
  fetchLists,
  createList,
  deleteList as apiDeleteList,
} from "../api/lists";

export default function useLists(selectedListId, setSelectedListId) {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");

  const loadLists = async () => {
    try {
      const data = await fetchLists();
      setLists(data);
      if (data.length > 0 && !selectedListId) {
        setSelectedListId(data[0].id);
      }
    } catch (error) {
      console.error("リスト取得エラー:", error);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const addList = async () => {
    if (!newListTitle.trim()) return;

    try {
      const newList = await createList(newListTitle);

      await fetch("http://127.0.0.1:8000/api/blocks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          list: newList.id,
          html: "",
          type: "text",
          order: 0,
        }),
      });

      setNewListTitle("");
      await loadLists();
      setSelectedListId(newList.id);
    } catch (error) {
      console.error("リスト追加エラー:", error);
    }
  };

  const deleteList = async (id) => {
    if (!confirm("このリストを削除しますか？")) return;

    try {
      await apiDeleteList(id);
      if (id === selectedListId) {
        setSelectedListId(null);
      }
      await loadLists();
    } catch (error) {
      console.error("リスト削除エラー:", error);
    }
  };

  return {
    lists,
    newListTitle,
    setNewListTitle,
    addList,
    deleteList,
  };
}
