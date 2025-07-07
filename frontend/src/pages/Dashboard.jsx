import React, { useEffect, useState } from "react";
import { fetchAllBlocks } from "../api/blocks";
import { format, isFuture, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns";
import {
  Calendar,
  Star,
  Clock,
  Bookmark,
  FileText,
  CheckSquare,
  List,
  Folder,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const all = await fetchAllBlocks();
        setNotes(all.filter((b) => b.type === "note"));
        setTasks(all.filter((b) => b.type === "task" || b.type === "task-done"));
        setPinnedItems(all.filter((b) => b.is_pinned));
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const completedTasks = tasks.filter((t) => t.type === "task-done");
  const pendingTasks = tasks.filter((t) => t.type === "task");
  const upcomingTasks = tasks.filter(
    (t) => t.due_date && isFuture(parseISO(t.due_date))
  );
  const todayTasks = tasks.filter(
    (t) => t.due_date && isToday(parseISO(t.due_date))
  );
  const tomorrowTasks = tasks.filter(
    (t) => t.due_date && isTomorrow(parseISO(t.due_date))
  );
  const thisWeekTasks = tasks.filter(
    (t) => t.due_date && isThisWeek(parseISO(t.due_date))
  );

  const recentActivity = [...notes, ...tasks]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 mx-8 space-y-8">
      {/* Header with Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[var(--color-flist-dark)]">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Notes</p>
              <p className="text-2xl font-semibold">{notes.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Bookmark className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {notes.length > 0 ? `${notes.length} notes created` : "No notes yet"}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasks Progress</p>
              <p className="text-2xl font-semibold">
                {completedTasks.length}/{tasks.length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {tasks.length > 0
              ? `${Math.round((completedTasks.length / tasks.length) * 100)}% completed`
              : "No tasks yet"}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Tasks</p>
              <p className="text-2xl font-semibold">{todayTasks.length}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {todayTasks.length > 0
              ? `${todayTasks.length} tasks due today`
              : "No tasks due today"}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pinned Items</p>
              <p className="text-2xl font-semibold">{pinnedItems.length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
              <Star className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {pinnedItems.length > 0
              ? `${pinnedItems.length} items pinned`
              : "No pinned items"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Recent Activity
            </h2>
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

          {/* Task Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-gray-500" />
              Task Overview
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Today</h3>
                <ul className="space-y-2">
                  {todayTasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span>{task.html.replace(/^- \[[ xX]\] /, "")}</span>
                    </li>
                  ))}
                  {todayTasks.length === 0 && (
                    <li className="text-sm text-gray-500">No tasks due today</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tomorrow</h3>
                <ul className="space-y-2">
                  {tomorrowTasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>{task.html.replace(/^- \[[ xX]\] /, "")}</span>
                    </li>
                  ))}
                  {tomorrowTasks.length === 0 && (
                    <li className="text-sm text-gray-500">No tasks due tomorrow</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              Upcoming Tasks
            </h2>
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
              {upcomingTasks.length === 0 && (
                <li className="text-sm text-gray-500">No upcoming tasks</li>
              )}
            </ul>
          </div>

          {/* Pinned Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-gray-500" />
              Pinned Items
            </h2>
            <ul className="space-y-3">
              {pinnedItems.map((item) => (
                <li key={item.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    {item.type === "note" ? (
                      <FileText className="w-4 h-4 text-blue-500" />
                    ) : (
                      <CheckSquare className="w-4 h-4 text-green-500" />
                    )}
                    <span className="font-medium">
                      {item.html?.match(/\[\[(.+?)\]\]/)?.[1] ||
                        item.html.replace(/^- \[[ xX]\] /, "").slice(0, 50)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Updated: {format(new Date(item.updated_at), "PPP")}
                  </p>
                </li>
              ))}
              {pinnedItems.length === 0 && (
                <li className="text-sm text-gray-500">No pinned items</li>
              )}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-500" />
              Quick Stats
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week's Tasks</span>
                <span className="text-sm font-medium">{thisWeekTasks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Tasks</span>
                <span className="text-sm font-medium">{pendingTasks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Tasks</span>
                <span className="text-sm font-medium">{completedTasks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
