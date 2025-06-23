import React, { useEffect, useState } from "react";
import { fetchTasks, createBlock } from "../api/blocks";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, parseISO, addWeeks, subWeeks, isWithinInterval, setHours, setMinutes, getHours, getDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { updateBlockDueDate } from "../api/blocks";

const getMonthMatrix = (currentMonth) => {
  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);
  const startDate = startOfWeek(startMonth, { weekStartsOn: 0 });
  const endDate = endOfWeek(endMonth, { weekStartsOn: 0 });
  const weeks = [];
  let day = startDate;
  while (day <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }
  return weeks;
};

export default function CalendarPage({ onSelectTask, selectedBlockId }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [view, setView] = useState("month"); // "month" or "week"
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDrag, setActiveDrag] = useState(null); // {taskId, fromDate}
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [modalTasks, setModalTasks] = useState([]);
  const [modalDate, setModalDate] = useState("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragSize, setDragSize] = useState({ width: 0, height: 0 });
  const [addModal, setAddModal] = useState({ open: false, date: null });
  const [addType, setAddType] = useState("task");
  const [addTitle, setAddTitle] = useState("");
  const [adding, setAdding] = useState(false);

  // DnD用センサー（クリックとドラッグを分離）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const allTasks = await fetchTasks();
        setTasks(allTasks.filter(t => t.due_date));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 日付ごとにタスクをグループ化
  const tasksByDate = {};
  tasks.forEach(task => {
    const dateKey = format(parseISO(task.due_date), "yyyy-MM-dd");
    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push(task);
  });

  // 週表示用: 1週間分の日付
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  // 週表示用: 6:00〜23:00の時間帯＋All Day
  const hours = ["All Day", ...Array.from({ length: 18 }, (_, i) => i + 6)];

  // 週表示用: 各セルに該当タスクを割り当てる
  const getTasksForCell = (date, hour) => {
    const dateKey = format(date, "yyyy-MM-dd");
    if (!tasksByDate[dateKey]) return [];
    if (hour === "All Day") {
      // 時刻がないタスク
      return tasksByDate[dateKey].filter(task => {
        const d = parseISO(task.due_date);
        return getHours(d) === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;
      });
    } else {
      // 指定時刻のタスク
      return tasksByDate[dateKey].filter(task => {
        const d = parseISO(task.due_date);
        return getHours(d) === hour;
      });
    }
  };

  const weeks = getMonthMatrix(currentMonth);

  // ドラッグ用ラッパー
  function DraggableTask({ task, children }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `task-${task.id}`,
      data: { taskId: task.id, fromDate: format(parseISO(task.due_date), "yyyy-MM-dd") },
    });
    // クリックとドラッグの両立: isDragging中はonClick無効
    const handleClick = (e) => {
      if (isDragging) return;
      if (onSelectTask) onSelectTask(task);
    };
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{ cursor: "grab" }}
        onClick={handleClick}
        className={`transition-all duration-200 select-none ${isDragging ? "opacity-80 scale-105 shadow-2xl z-50" : ""}`}
      >
        {children}
      </div>
    );
  }

  // ドロップ用ラッパー
  function DroppableDateCell({ date, isOver, isToday, isSelected, children, onClick }) {
    const { setNodeRef, isOver: isDropping } = useDroppable({
      id: `date-${format(date, "yyyy-MM-dd")}`,
      data: { date: format(date, "yyyy-MM-dd") },
    });
    return (
      <div
        ref={setNodeRef}
        className={`rounded-xl p-2 min-h-[80px] border text-left flex flex-col gap-1 transition-all duration-200 bg-white/70 backdrop-blur-sm
          ${isToday ? "border-2 border-[var(--color-flist-accent)] bg-[var(--color-flist-blue-light)]/30" : "border border-[var(--color-flist-border)]"}
          ${isSelected ? "ring-2 ring-[var(--color-flist-accent)]" : ""}
          ${(isOver || isDropping) ? "ring-2 ring-[var(--color-flist-accent)] bg-[var(--color-flist-accent)]/10" : ""}
          hover:bg-[var(--color-flist-blue-light)]/20`}
        style={{ position: "relative" }}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  // DnDハンドラ
  const handleDragStart = (event) => {
    if (event.active && event.active.data) {
      setActiveDrag(event.active.data.current);
    }
    // クリック位置と要素左上の差分＋要素サイズを記録
    if (event.activatorEvent && event.active && event.active.rect) {
      const pointerEvent = event.activatorEvent;
      const rect = event.active.rect.current.translated;
      if (pointerEvent && rect) {
        setDragOffset({
          x: pointerEvent.clientX - rect.left,
          y: pointerEvent.clientY - rect.top,
        });
        setDragSize({
          width: rect.width,
          height: rect.height,
        });
      }
    }
  };
  const handleDragEnd = async (event) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!active || !over) return;
    const taskId = active.data.current.taskId;
    const fromDate = active.data.current.fromDate;
    const toDate = over.data.current.date;
    if (fromDate === toDate) return;
    try {
      await updateBlockDueDate(taskId, toDate);
      setTasks((prev) => prev.map(t => t.id === taskId ? { ...t, due_date: toDate } : t));
    } catch (e) {
      alert("Failed to update due date");
    }
  };

  // ドラッグ中のタスク情報を取得
  const draggingTask = activeDrag ? tasks.find(t => t.id === activeDrag.taskId) : null;

  // DragOverlayのmodifiers
  const overlayModifiers = [
    ({ transform }) => {
      if (!dragOffset || !dragSize) return transform;
      // タスクの中心がマウスの真下になるように補正
      return {
        ...transform,
        x: transform.x + dragOffset.x - dragSize.width / 2,
        y: transform.y + dragOffset.y - dragSize.height / 2,
      };
    },
  ];

  // 新規追加モーダルの保存処理
  const handleAddItem = async () => {
    if (!addTitle.trim() || !addModal.date) return;
    setAdding(true);
    try {
      const payload = {
        html: addType === "task" ? `- [ ] ${addTitle}` : addTitle,
        type: addType,
        due_date: addModal.date,
        order: Date.now(),
      };
      const newBlock = await createBlock(payload);
      setTasks((prev) => [...prev, newBlock]);
      setAddModal({ open: false, date: null });
      setAddTitle("");
    } catch (e) {
      alert("追加に失敗しました");
    } finally {
      setAdding(false);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50/80 via-white/80 to-blue-100/60 rounded-2xl shadow-lg max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="ml-4 flex gap-2">
            <button
              className={`px-3 py-1 rounded-t-lg border-b-2 ${view === "month" ? "border-[var(--color-flist-accent)] text-[var(--color-flist-accent)] bg-white/90" : "border-transparent text-blue-300 bg-blue-50/60"}`}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 rounded-t-lg border-b-2 ${view === "week" ? "border-[var(--color-flist-accent)] text-[var(--color-flist-accent)] bg-white/90" : "border-transparent text-blue-300 bg-blue-50/60"}`}
              onClick={() => setView("week")}
            >
              Week
            </button>
          </div>
          <div className="ml-auto flex gap-2">
            {view === "month" ? (
              <>
                <button
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  onClick={() => setCurrentMonth(prev => addDays(startOfMonth(prev), -1))}
                >
                  &lt;
                </button>
                <span className="font-medium text-lg text-[var(--color-flist-dark)]">{format(currentMonth, "yyyy年 M月")}</span>
                <button
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  onClick={() => setCurrentMonth(prev => addDays(endOfMonth(prev), 1))}
                >
                  &gt;
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  onClick={() => setCurrentWeek(prev => subWeeks(prev, 1))}
                >
                  &lt;
                </button>
                <span className="font-medium text-lg text-[var(--color-flist-dark)]">{format(currentWeek, "yyyy年 M月 d日")} - {format(addDays(currentWeek, 6), "M月 d日")}</span>
                <button
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  onClick={() => setCurrentWeek(prev => addWeeks(prev, 1))}
                >
                  &gt;
                </button>
              </>
            )}
          </div>
        </div>
        {view === "month" ? (
          <>
            <div className="grid grid-cols-7 gap-px bg-gradient-to-r from-blue-100/30 to-transparent rounded-xl overflow-hidden text-center text-xs font-semibold text-[var(--color-flist-accent)] mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="py-2 bg-[var(--color-flist-blue-light)]/40">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-blue-100/30 rounded-xl overflow-hidden">
              {weeks.flat().map((day, idx) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const isSelected = false;
                const tasksForDay = tasksByDate[dateKey] || [];
                const maxShow = 2;
                const showTasks = tasksForDay.slice(0, maxShow);
                const moreCount = tasksForDay.length - maxShow;
                const isOver = activeDrag && activeDrag.taskId && activeDrag.fromDate !== dateKey && activeDrag.overDate === dateKey;
                return (
                  <DroppableDateCell
                    key={dateKey}
                    date={day}
                    isOver={isOver}
                    isToday={isToday}
                    isSelected={isSelected}
                    // 日付セル全体クリックで新規追加モーダル
                    onClick={() => {
                      setAddModal({ open: true, date: dateKey });
                      setAddType("task");
                      setAddTitle("");
                    }}
                  >
                    <div className={`flex items-center justify-between mb-1`}>
                      <span className={`text-xs font-bold ${isToday ? "text-[var(--color-flist-accent)]" : "text-blue-700/80"}`}>{format(day, "d")}</span>
                      {isToday && <span className="ml-1 px-2 py-0.5 rounded-full bg-[var(--color-flist-accent)]/20 text-[var(--color-flist-accent)] text-[10px]">Today</span>}
                    </div>
                    <div className="flex flex-col gap-1 h-20 overflow-hidden">
                      {showTasks.map(task => (
                        <DraggableTask key={task.id} task={task}>
                          <div
                            className={`truncate text-xs px-2 py-1 rounded-xl border cursor-pointer transition-all duration-150 shadow-sm
                              ${selectedBlockId === task.id
                                ? "bg-gradient-to-r from-[var(--color-flist-accent)]/90 to-blue-400/80 text-white border-[var(--color-flist-accent)] shadow-lg"
                                : "bg-gradient-to-r from-[var(--color-flist-blue-light)]/80 to-white/90 text-blue-900 border-blue-100/60 hover:bg-[var(--color-flist-accent)]/20 hover:border-[var(--color-flist-accent)]"
                            }`}
                            onClick={e => { e.stopPropagation(); }}
                          >
                            {task.html.replace(/^- \[[ xX]\] /, "")}
                          </div>
                        </DraggableTask>
                      ))}
                      {moreCount > 0 && (
                        <button
                          className="text-xs text-[var(--color-flist-accent)] hover:underline mt-1 px-2 py-0.5 rounded bg-[var(--color-flist-accent)]/10 hover:bg-[var(--color-flist-accent)]/30 transition-colors"
                          onClick={e => {
                            e.stopPropagation();
                            setModalTasks(tasksForDay);
                            setModalDate(dateKey);
                            setShowMoreModal(true);
                          }}
                        >
                          +{moreCount}件
                        </button>
                      )}
                    </div>
                  </DroppableDateCell>
                );
              })}
            </div>
            {/* モーダル */}
            {showMoreModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-xl shadow-xl p-6 min-w-[280px] max-w-xs w-full">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-bold text-[var(--color-flist-accent)]">{modalDate}</div>
                    <button className="text-gray-400 hover:text-[var(--color-flist-accent)]" onClick={() => setShowMoreModal(false)}>&times;</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {modalTasks.map(task => (
                      <DraggableTask key={task.id} task={task}>
                        <div
                          className={`truncate text-xs px-2 py-1 rounded-lg border cursor-pointer transition-colors shadow-sm ${
                            selectedBlockId === task.id
                              ? "bg-[var(--color-flist-accent)] text-white border-[var(--color-flist-accent)]"
                              : "bg-[var(--color-flist-surface)] text-[var(--color-flist-dark)] border-[var(--color-flist-border)] hover:bg-[var(--color-flist-blue-light)]"
                          }`}
                        >
                          {task.html.replace(/^- \[[ xX]\] /, "")}
                        </div>
                      </DraggableTask>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // 週表示（タイムブロッキング）
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-20 bg-gray-50"></th>
                  {weekDays.map(day => (
                    <th key={format(day, "yyyy-MM-dd")}
                        className="text-center text-xs font-semibold py-2 bg-gray-50 border-b border-gray-200">
                      {format(day, "EEE d")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour, i) => (
                  <tr key={hour}>
                    <td className={`text-xs text-right pr-2 py-1 align-top bg-gray-50 border-b border-gray-100 ${i === 0 ? "font-bold" : ""}`}>{hour === "All Day" ? "All Day" : `${hour}:00`}</td>
                    {weekDays.map(day => (
                      <td key={format(day, "yyyy-MM-dd") + hour}
                          className={`align-top border-b border-gray-100 px-1 py-0.5 min-h-[32px] ${i === 0 ? "bg-gray-50" : ""}`}>
                        <div className="flex flex-col gap-0.5">
                          {getTasksForCell(day, hour).map(task => (
                            <div
                              key={task.id}
                              className={`truncate text-xs px-1 py-0.5 rounded border cursor-pointer transition-colors ${
                                selectedBlockId === task.id
                                  ? "bg-blue-600 text-white border-blue-700"
                                  : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                              }`}
                            >
                              {task.html.replace(/^- \[[ xX]\] /, "")}<br/>
                              <span className="text-[10px] text-blue-400">{hour === "All Day" ? format(parseISO(task.due_date), "yyyy-MM-dd") : format(parseISO(task.due_date), "HH:mm")}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      {/* DragOverlay: ドラッグ中はマウスに追従してタスクカードを表示 */}
      <DragOverlay dropAnimation={null} modifiers={overlayModifiers}>
        {draggingTask && (
          <div
            className="truncate text-xs px-4 py-2 rounded-xl border shadow-2xl bg-[var(--color-flist-accent)] text-white border-[var(--color-flist-accent)] opacity-80 scale-110 transition-all duration-150 z-50 select-none pointer-events-none"
            style={{ minWidth: 120, maxWidth: 220 }}
          >
            {draggingTask.html.replace(/^- \[[ xX]\] /, "")}
          </div>
        )}
      </DragOverlay>
      {/* 新規追加モーダル */}
      {addModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 min-w-[320px] max-w-xs w-full">
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold text-[var(--color-flist-accent)]">{addModal.date} に追加</div>
              <button className="text-gray-400 hover:text-[var(--color-flist-accent)]" onClick={() => setAddModal({ open: false, date: null })}>&times;</button>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                className={`flex-1 py-1 rounded-lg border text-sm font-medium transition-colors ${addType === "task" ? "bg-[var(--color-flist-accent)] text-white border-[var(--color-flist-accent)]" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-blue-50"}`}
                onClick={() => setAddType("task")}
              >タスク</button>
              <button
                className={`flex-1 py-1 rounded-lg border text-sm font-medium transition-colors ${addType === "event" ? "bg-[var(--color-flist-accent)] text-white border-[var(--color-flist-accent)]" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-blue-50"}`}
                onClick={() => setAddType("event")}
              >イベント</button>
            </div>
            <input
              className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-flist-accent)] bg-gray-50"
              placeholder={addType === "task" ? "タスクのタイトル" : "イベントのタイトル"}
              value={addTitle}
              onChange={e => setAddTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddItem(); }}
              autoFocus
            />
            <button
              className="w-full py-2 rounded-lg bg-[var(--color-flist-accent)] text-white font-semibold hover:bg-[var(--color-flist-accent)]/90 transition-colors disabled:opacity-50"
              onClick={handleAddItem}
              disabled={!addTitle.trim() || adding}
            >
              {adding ? "追加中..." : "追加"}
            </button>
          </div>
        </div>
      )}
    </DndContext>
  );
} 