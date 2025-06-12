import React, { useEffect, useState } from "react";
import { fetchAllBlocks } from "../api/blocks";
import { format, isFuture, parseISO } from "date-fns";
import {
  Calendar,
  Star,
  Clock,
  Bookmark,
  FileText,
  CheckSquare,
} from "lucide-react";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const all = await fetchAllBlocks();
      setNotes(all.filter((b) => b.type === "note"));
      setTasks(all.filter((b) => b.type === "task" || b.type === "task-done"));
      setPinnedItems(all.filter((b) => b.is_pinned));
    };
    load();
  }, []);

  const completedTasks = tasks.filter((t) => t.type === "task-done");
  const upcomingTasks = tasks.filter(
    (t) => t.due_date && isFuture(parseISO(t.due_date))
  );

  const recentActivity = [...notes, ...tasks]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  return (
    <div className="p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Notes</p>
            <p className="text-2xl font-semibold">{notes.length}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <Bookmark className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Completed Tasks</p>
            <p className="text-2xl font-semibold">{completedTasks.length}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-full text-green-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Upcoming Tasks</p>
            <p className="text-2xl font-semibold">{upcomingTasks.length}</p>
          </div>
          <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pinned Items</p>
            <p className="text-2xl font-semibold">{pinnedItems.length}</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-full text-purple-600">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Activity + Side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>
                        {item.type === "note" ? (
                          <FileText className="w-4 h-4 text-blue-500" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-green-500" />
                        )}
                      </span>
                      <span className="font-medium">
                        {item.html?.match(/\[\[(.+?)\]\]/)?.[1] ||
                          item.html.replace(/^- \[[ xX]\] /, "").slice(0, 50)}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(item.updated_at), "PPP")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
            <ul className="space-y-3">
              {upcomingTasks.slice(0, 5).map((task) => (
                <li
                  key={task.id}
                  className="text-sm text-gray-700 flex gap-2 items-start"
                >
                  <span className="mt-1">🟢</span>
                  <div>
                    <p>{task.html.replace(/^- \[[ xX]\] /, "")}</p>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(task.due_date), "PPpp")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">Pinned Items</h2>
            <ul className="space-y-2">
              {pinnedItems.map((item) => (
                <li key={item.id} className="text-sm text-gray-700">
                  <span className="font-medium">
                    {item.html?.match(/\[\[(.+?)\]\]/)?.[1] ||
                      item.html.replace(/^- \[[ xX]\] /, "").slice(0, 50)}
                  </span>
                  <p className="text-xs text-gray-400">
                    Updated: {format(new Date(item.updated_at), "PPP")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
