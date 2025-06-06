import useLists from "../hooks/useLists";
import logo from "../assets/logo.png";

const Sidebar = ({ sidebarOpen, selectedListId, setSelectedListId }) => {
  const { lists, newListTitle, setNewListTitle, addList, deleteList } =
    useLists(selectedListId, setSelectedListId);

  return (
    <div
      className={`${
        sidebarOpen ? "w-72" : "w-0"
      } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-sm`}
    >
      <div className="p-6 border-b border-blue-100">
        <div className="flex items-center space-x-2 mb-6">
          <img src={logo} alt="Flist Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-blue-800 tracking-tight">
            Flist
          </h1>
        </div>

        <div
          className={`mb-1 px-3 py-2 rounded-lg cursor-pointer transition ${
            selectedListId === "tasks"
              ? "bg-blue-100 text-blue-800 font-semibold"
              : "hover:bg-gray-100 text-gray-800"
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
        <div
          className={`mb-6 p-3 rounded-xl cursor-pointer transition-colors ${
            selectedListId === "notes"
              ? "bg-blue-100 border-2 border-blue-300"
              : "hover:bg-blue-50 border border-transparent"
          }`}
          onClick={() => setSelectedListId("notes")}
        >
          <h3
            className={`font-semibold ${
              selectedListId === "notes" ? "text-blue-800" : "text-gray-800"
            }`}
          >
            📘 Notes
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
                addList();
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none backdrop-blur-sm shadow-inner"
          />
          <button
            onClick={addList}
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
                  deleteList(list.id);
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
