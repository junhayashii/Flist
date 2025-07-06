import { useEffect, useState, useRef } from "react";
import { fetchAllBlocks } from "../api/blocks";
import { fetchListMap } from "../api/lists";
import TaskBlock from "../components/blocks/TaskBlock";
import BlockDetails from "../components/BlockDetails";

export default function Inbox() {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const taskRefs = useRef({});

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      try {
        const [blocks, listMap] = await Promise.all([
          fetchAllBlocks(),
          fetchListMap(),
        ]);
        // Inbox: tasks with no due_date and not completed
        const inboxTasks = blocks.filter(
          (b) => b.type === "task" && !b.due_date && !b.done
        );
        setTasks(inboxTasks);
        setLists(listMap);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8 mx-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[var(--color-flist-dark)]">Inbox</h1>
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-flist-accent)]"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-[var(--color-flist-muted)] py-8">No inbox tasks!</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm">
                <TaskBlock
                  block={task}
                  onClick={() => setSelectedTask(task)}
                  onOpenDetail={() => setSelectedTask(task)}
                  isSelected={selectedTask?.id === task.id}
                  editableRef={(el) => (taskRefs.current[task.id] = el)}
                  listName={lists[task.list] ? lists[task.list] : undefined}
                />
              </div>
            ))
          )}
        </div>
      </div>
      {selectedTask && (
        <BlockDetails
          block={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={setSelectedTask}
        />
      )}
    </div>
  );
} 