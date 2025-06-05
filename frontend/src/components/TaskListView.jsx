// src/components/TaskListView.jsx
import React, { useState, useEffect, useRef } from "react";
import BlockDetails from "./BlockDetails";
import TaskBlock from "./TaskBlock";
import { fetchTasks, createTask, updateTask, deleteBlock } from "../api/blocks";
import { fetchListMap } from "../api/lists";

const TaskListView = () => {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState({});
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const taskRefs = useRef({});

  useEffect(() => {
    const loadData = async () => {
      const [taskData, listMap] = await Promise.all([
        fetchTasks(),
        fetchListMap(),
      ]);
      setTasks(taskData);
      setLists(listMap);
    };
    loadData();
  }, []);

  const addTask = async () => {
    if (!newTaskText.trim()) return;

    const base = newTaskText.trim();
    const html = /^- \[[ xX]\] /.test(base) ? base : `- [ ] ${base}`;
    const newTask = await createTask(html);
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
  };

  const handleDelete = async (task) => {
    console.log("削除対象タスク:", task);
    try {
      await deleteBlock(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      console.error("タスク削除失敗:", err);
    }
  };

  const handleToggle = async (task) => {
    const updated = {
      ...task,
      type: task.type === "task-done" ? "task" : "task-done",
      html:
        (task.type === "task-done" ? "- [ ] " : "- [x] ") +
        task.html.replace(/^- \[[ x]\] /, ""),
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    await updateTask(updated);
  };

  const handleBlur = async (task) => {
    const el = taskRefs.current[task.id];
    if (!el) return;
    const html = el.innerText;
    const updated = {
      ...task,
      html:
        html.startsWith("- [ ] ") || html.startsWith("- [x] ")
          ? html
          : task.type === "task-done"
          ? "- [x] " + html
          : "- [ ] " + html,
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, html: updated.html } : t))
    );
    await updateTask(updated);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-white/70 backdrop-blur-md">
        <h1 className="text-2xl font-bold">すべてのタスク</h1>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="border px-2 py-1 rounded w-full"
            placeholder="新しいタスクを追加"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTask();
              }
            }}
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            追加
          </button>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskBlock
              key={task.id}
              block={task}
              isEditable={true}
              editableRef={(el) => (taskRefs.current[task.id] = el)}
              onClick={() => {
                // クリックで切り替えロジックを実行
                setSelectedTask((prev) => (prev?.id === task.id ? null : task));
              }}
              onToggle={handleToggle}
              onOpenDetail={() => {
                // 詳細アイコンから開いた場合のみ明示的に開く
                setSelectedTask(task);
              }}
              onBlur={handleBlur}
              listName={task.list ? lists[task.list] : "Inbox"}
              onDelete={() => handleDelete(task)}
              isSelected={selectedTask?.id === task.id}
            />
          ))}
        </div>
      </div>

      {selectedTask &&
        (selectedTask.type === "task" || selectedTask.type === "task-done") && (
          <BlockDetails
            block={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(updatedBlock) => {
              setTasks((prev) =>
                prev.map((t) => (t.id === updatedBlock.id ? updatedBlock : t))
              );
              setSelectedTask(updatedBlock);
            }}
          />
        )}
    </div>
  );
};

export default TaskListView;
