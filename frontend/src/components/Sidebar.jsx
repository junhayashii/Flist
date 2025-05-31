import { useEffect, useState } from "react";

const Sidebar = ({ sidebarOpen, selectedListId, setSelectedListId }) => {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");

  const fetchLists = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/lists/");
      const data = await res.json();
      setLists(data);
      if (data.length > 0 && !selectedListId) {
        setSelectedListId(data[0].id);
      }
    } catch (error) {
      console.error("リスト取得エラー:", error);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;

    try {
      const listRes = await fetch("http://127.0.0.1:8000/api/lists/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newListTitle }),
      });

      if (!listRes.ok) {
        throw new Error("リスト作成エラー");
      }

      const newList = await listRes.json();

      await fetch("http://127.0.0.1:8000/api/blocks/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          list: newList.id,
          html: "",
          type: "text",
          order: 0,
        }),
      });

      setNewListTitle("");
      fetchLists();
      setSelectedListId(newList.id);
    } catch (error) {
      console.error("リスト追加エラー:", error);
    }
  };

  const handleDeleteList = async (id) => {
    if (!confirm("このリストを削除しますか？")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/lists/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (id === selectedListId) {
          setSelectedListId(null);
        }
        fetchLists();
      }
    } catch (error) {
      console.error("リスト削除エラー:", error);
    }
  };

  return (
    <div
      className={`${
        sidebarOpen ? "w-80" : "w-0"
      } transition-all duration-300 bg-white/70 backdrop-blur-md border-r border-blue-200 flex flex-col overflow-hidden shadow-xl`}
    >
      <div className="p-6 border-b border-blue-100">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-6 tracking-tight">
          📘 Flist
        </h1>

        <div
          className={`mb-6 p-3 rounded-xl cursor-pointer transition-colors ${
            selectedListId === "tasks"
              ? "bg-blue-100 border-2 border-blue-300"
              : "hover:bg-blue-50 border border-transparent"
          }`}
          onClick={() => setSelectedListId("tasks")}
        >
          <h3
            className={`font-semibold ${
              selectedListId === "tasks" ? "text-blue-800" : "text-gray-800"
            }`}
          >
            ✅ Tasks
          </h3>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="新しいリスト名"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddList();
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none backdrop-blur-sm shadow-inner"
          />
          <button
            onClick={handleAddList}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow"
          >
            リストを追加
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                selectedListId === list.id
                  ? "bg-blue-100 border-2 border-blue-300"
                  : "hover:bg-blue-50 border border-transparent"
              }`}
              onClick={() => setSelectedListId(list.id)}
            >
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium truncate ${
                    selectedListId === list.id
                      ? "text-blue-900"
                      : "text-gray-900"
                  }`}
                >
                  {list.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {list.created_at &&
                    new Date(list.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteList(list.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
