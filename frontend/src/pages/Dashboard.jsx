import React, { useEffect, useState } from "react";
import { fetchAllBlocks } from "../api/blocks";
import { fetchListMap } from "../api/lists";
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
  Tag,
} from "lucide-react";

export default function Dashboard({ setSelectedTask, setSelectedListId }) {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);
  const [lists, setLists] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [all, listMap] = await Promise.all([
          fetchAllBlocks(),
          fetchListMap(),
        ]);
        setNotes(all.filter((b) => b.type === "note"));
        setTasks(all.filter((b) => b.type === "task" || b.type === "task-done"));
        setPinnedItems(all.filter((b) => b.is_pinned));
        setLists(listMap);
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
    (t) => t.due_date && isFuture(parseISO(t.due_date)) && t.type === "task"
  ).sort((a, b) => parseISO(a.due_date) - parseISO(b.due_date));

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

  // Get recent notes (sorted by updated_at)
  const recentNotes = notes
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 3);

  // Helper function to format due date
  const formatDueDate = (dueDate) => {
    const date = parseISO(dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM dd");
  };

  // Handle item click
  const handleItemClick = (item) => {
    if (setSelectedTask && setSelectedListId) {
      setSelectedTask(item);
      // Add a small delay to ensure the task is set before navigation
      setTimeout(() => {
        if (item.type === "note") {
          setSelectedListId("notes");
        } else {
          setSelectedListId("tasks");
        }
      }, 10);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-6 space-y-6">
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
        {/* Left Column: Upcoming Tasks & Recent Notes */}
        <div className="space-y-6 lg:col-span-2 flex flex-col">
          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-gray-500" />
              Upcoming Tasks
            </h2>
            <ul className="divide-y divide-gray-200 flex-1">
              {upcomingTasks.slice(0, 8).map((task) => (
                <li key={task.id} className="py-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleItemClick(task)}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 flex-1 min-w-0">
                      <span>
                        <CheckSquare className="w-4 h-4 text-green-500" />
                      </span>
                      <span className="font-medium truncate">
                        {task.html.replace(/^- \[[ xX]\] /, "")}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 ml-2">
                      {/* List name */}
                      {task.list && lists[task.list] && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-gray-600 text-xs font-medium whitespace-nowrap">
                          <List className="w-3 h-3" />
                          {lists[task.list]}
                        </span>
                      )}
                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <span className="flex gap-1">
                          {task.tags.map(tag => (
                            <span
                              key={tag.id}
                              title={tag.name.length > 16 ? tag.name : undefined}
                              className="flex items-center gap-1 px-2 py-0.5 text-gray-600 text-xs font-medium whitespace-nowrap"
                            >
                              <Tag className="w-3 h-3" />
                              {tag.name.length > 8 ? tag.name.slice(0, 6) + '…' : tag.name}
                            </span>
                          ))}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                        {task.due_date && (
                          <>
                            <Calendar className="w-3 h-3" />
                            {formatDueDate(task.due_date)}
                          </>
                        )}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
              {upcomingTasks.length === 0 && (
                <li className="py-3 text-sm text-gray-500">No upcoming tasks</li>
              )}
            </ul>
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex-1 flex flex-col">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Recent Notes
            </h2>
            <ul className="divide-y divide-gray-200 flex-1">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <li key={note.id} className="py-2 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleItemClick(note)}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 flex-1 min-w-0">
                        <span>
                          <FileText className="w-4 h-4 text-blue-500" />
                        </span>
                        <span className="font-medium truncate">
                          {note.html?.match(/\[\[(.+?)\]\]/)?.[1] ||
                            note.html.replace(/^- \[[ xX]\] /, "").slice(0, 40)}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 ml-2">
                        {/* List name */}
                        {note.list && lists[note.list] && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-gray-600 text-xs font-medium whitespace-nowrap">
                            <List className="w-3 h-3" />
                            {lists[note.list]}
                          </span>
                        )}
                        {/* Tags */}
                        {note.tags && note.tags.length > 0 && (
                          <span className="flex gap-1">
                            {note.tags.map(tag => (
                              <span
                                key={tag.id}
                                title={tag.name.length > 16 ? tag.name : undefined}
                                className="flex items-center gap-1 px-2 py-0.5 text-gray-600 text-xs font-medium whitespace-nowrap"
                              >
                                <Tag className="w-3 h-3" />
                                {tag.name.length > 8 ? tag.name.slice(0, 6) + '…' : tag.name}
                              </span>
                            ))}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {format(new Date(note.updated_at), "MMM dd")}
                        </span>
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-2 text-sm text-gray-500">No recent notes</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column: Recent Activity, Pinned Items, Quick Stats */}
        <div className="space-y-6 flex flex-col">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Recent Activity
            </h2>
            <ul className="divide-y divide-gray-200 flex-1">
              {recentActivity.slice(0, 4).map((item) => (
                <li key={item.id} className="py-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleItemClick(item)}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 flex-1 min-w-0">
                      <span>
                        {item.type === "note" ? (
                          <FileText className="w-4 h-4 text-blue-500" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-green-500" />
                        )}
                      </span>
                      <span className="font-medium truncate">
                        {item.html?.match(/\[\[(.+?)\]\]/)?.[1] ||
                          item.html.replace(/^- \[[ xX]\] /, "").slice(0, 50)}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {format(new Date(item.updated_at), "MMM dd")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pinned Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-gray-500" />
              Pinned Items
            </h2>
            <ul className="divide-y divide-gray-200 flex-1">
              {pinnedItems.map((item) => (
                <li key={item.id} className="py-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleItemClick(item)}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 flex-1 min-w-0">
                      {item.type === "note" ? (
                        <FileText className="w-4 h-4 text-blue-500" />
                      ) : (
                        <CheckSquare className="w-4 h-4 text-green-500" />
                      )}
                      <span className="font-medium truncate">
                        {item.html?.match(/\[\[(.+?)\]\]/)?.[1] ||
                          item.html.replace(/^- \[[ xX]\] /, "").slice(0, 50)}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {format(new Date(item.updated_at), "MMM dd")}
                    </span>
                  </div>
                </li>
              ))}
              {pinnedItems.length === 0 && (
                <li className="py-3 text-sm text-gray-500">No pinned items</li>
              )}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-500" />
              Quick Stats
            </h2>
            <div className="space-y-3 flex-1">
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
