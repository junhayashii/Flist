import React, { useState, useEffect } from "react";
import BlockEditor from "./BlockEditor";
import BlockDetails from "./BlockDetails";
import TaskPage from "./TaskPage";
import { fetchLists } from "../api/lists"; // ← 追加

const MainContent = ({ selectedListId, sidebarOpen, setSidebarOpen }) => {
  const [lists, setLists] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const data = await fetchLists();
        setLists(data);
      } catch (error) {
        console.error("リスト取得エラー:", error);
      }
    };
    loadLists();
  }, []);

  const selectedList = lists.find((list) => list.id === selectedListId);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* メイン編集ペイン */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white/70 backdrop-blur-md">
        {/* ヘッダー */}
        <div className="bg-white/70 backdrop-blur-sm shadow-md border-b border-flist-blue px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-flist-dark hover:text-flist-blue rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2
              className={`text-xl font-semibold tracking-tight ${
                selectedList ? "text-flist-dark" : "text-gray-400"
              }`}
            >
              {selectedList ? selectedList.title : "リスト未選択"}
            </h2>
          </div>
          <div className="text-sm text-gray-500">
            最終更新: {new Date().toLocaleString("ja-JP")}
          </div>
        </div>

        {/* ブロック or タスク一覧 */}
        <div className="flex-1 overflow-y-auto">
          {selectedListId === "tasks" ? (
            <TaskPage />
          ) : selectedListId ? (
            <div className="max-w-4xl mx-auto p-6">
              <BlockEditor
                listId={selectedListId}
                onSelectedBlock={(block) => setSelectedBlock(block)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  リストを選択してください
                </h3>
                <p className="text-gray-500">
                  左のサイドバーからリストを選択するか、新しいリストを作成してください。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* タスクの詳細パネル（右） */}
      {selectedBlock &&
        (selectedBlock.type === "task" ||
          selectedBlock.type === "task-done") && (
          <BlockDetails block={selectedBlock} />
        )}
    </div>
  );
};

export default MainContent;
