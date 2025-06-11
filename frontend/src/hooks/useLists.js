import { useState, useEffect } from "react";
import {
  fetchLists,
  createList,
  deleteList as apiDeleteList,
  updateListTitle as apiUpdateListTitle,
} from "../api/lists";

export default function useLists(selectedListId, setSelectedListId) {
  const [lists, setLists] = useState([]);

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

  const addList = async (title) => {
    const safeTitle = (title || "").trim() || "新しいリスト";
    try {
      const newList = await createList(safeTitle);

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

      await loadLists();
      setSelectedListId(newList.id);
      return newList.id;
    } catch (error) {
      console.error("リスト追加エラー:", error);
      throw error;
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

  const updateListTitle = async (id, title) => {
    try {
      const updated = await apiUpdateListTitle(id, title);
      setLists((prev) =>
        prev.map((l) =>
          l.id === updated.id ? { ...l, title: updated.title } : l
        )
      );
    } catch (error) {
      console.error("リストタイトル更新エラー:", error);
    }
  };

  return {
    lists,
    addList,
    deleteList,
    updateListTitle,
  };
}
