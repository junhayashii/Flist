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
      // First create the list
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

      // Then create an initial block for the list
      const blockRes = await fetch("http://127.0.0.1:8000/api/blocks/", {
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

      if (!blockRes.ok) {
        throw new Error("ブロック作成エラー");
      }

      setNewListTitle("");
      fetchLists();
      setSelectedListId(newList.id); // Select the newly created list
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
      } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
    >
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">📝 ノート</h1>

        <div 
          className={`mb-4 p-3 rounded-lg cursor-pointer transition-colors ${
            selectedListId === 'tasks'
              ? "bg-blue-50 border-2 border-blue-200"
              : "hover:bg-gray-50 border-2 border-transparent"
          }`}
          onClick={() => setSelectedListId('tasks')}
        >
          <h3 className={`font-medium ${
            selectedListId === 'tasks'
              ? "text-blue-900"
              : "text-gray-900"
          }`}>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleAddList}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedListId === list.id
                  ? "bg-blue-50 border-2 border-blue-200"
                  : "hover:bg-gray-50 border-2 border-transparent"
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
                <p className="text-sm text-gray-500 mt-1">
                  {list.created_at &&
                    new Date(list.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteList(list.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
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
