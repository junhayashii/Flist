import React, { useState, useEffect, useRef } from "react";
import BlockEditor from "./BlockEditor";

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [newListTitle, setNewListTitle] = useState("");
  const inputRef = useRef(null);

  const fetchLists = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/lists/");
    const data = await res.json();
    setLists(data);
    if (data.length > 0 && !selectedListId) {
      setSelectedListId(data[0].id);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    const res = await fetch("http://127.0.0.1:8000/api/lists/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newListTitle }),
    });

    if (res.ok) {
      setNewListTitle("");
      fetchLists();
      inputRef.current?.focus(); // フォーカスを戻す
    }
  };

  const handleDeleteList = async (id) => {
    if (!confirm("このリストを削除しますか？")) return;

    const res = await fetch(`http://127.0.0.1:8000/api/lists/${id}/`, {
      method: "DELETE",
    });

    if (res.ok) {
      const newLists = lists.filter((l) => l.id !== id);
      setLists(newLists);
      if (id === selectedListId) {
        setSelectedListId(newLists[0]?.id || null);
      }
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">📁 Lists</h2>

      <form onSubmit={handleAddList} className="flex mb-4 space-x-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="新しいリスト名"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          追加
        </button>
      </form>

      <ul className="space-y-2">
        {lists.map((list) => (
          <li key={list.id} className="flex items-center justify-between">
            <button
              onClick={() => setSelectedListId(list.id)}
              className={`text-left flex-1 ${
                selectedListId === list.id ? "font-bold text-blue-600" : ""
              }`}
            >
              {list.title}
            </button>
            <button
              onClick={() => handleDeleteList(list.id)}
              className="text-red-500 hover:text-red-700"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>

      {selectedListId && (
        <div className="mt-6">
          <BlockEditor listId={selectedListId} />
        </div>
      )}
    </div>
  );
};

export default Lists;
