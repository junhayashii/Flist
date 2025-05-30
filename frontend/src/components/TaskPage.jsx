import React, { useEffect, useState, useRef } from "react";
import BlockDetails from "./BlockDetails";
import { fetchTasks, createTask, updateTask } from "../api/blocks";
import { fetchListMap } from "../api/lists";

export default function TaskPage() {
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

    const newTask = await createTask(newTaskText);
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
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

  return (
    <div className="flex">
      <div className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold">すべてのタスク</h1>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="border px-2 py-1 rounded w-full"
            placeholder="新しいタスクを追加"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            追加
          </button>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => {
            const label = task.html.replace(/^- \[[ x]\] /, "");
            const isDone = task.type === "task-done";

            return (
              <div
                key={task.id}
                className="p-3 border rounded bg-white flex justify-between items-center"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggle(task);
                    }}
                  />
                  <div
                    ref={(el) => (taskRefs.current[task.id] = el)}
                    contentEditable
                    suppressContentEditableWarning
                    className={`outline-none flex-1 mr-4 ${
                      isDone ? "line-through text-gray-400" : ""
                    }`}
                    onBlur={() => handleBlur(task)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {label}
                  </div>
                </div>
                {task.due_date && (
                  <div className="text-xs text-gray-500 mt-1">
                    期日: {new Date(task.due_date).toLocaleDateString("ja-JP")}
                  </div>
                )}
                <span className="text-sm text-gray-500">
                  {task.list ? lists[task.list] || "読み込み中…" : "Inbox"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTask && <BlockDetails block={selectedTask} />}
    </div>
  );
}
