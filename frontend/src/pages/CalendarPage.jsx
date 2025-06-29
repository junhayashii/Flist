import React, { useEffect, useState } from "react";
import { fetchTasks, createBlock, createTask, updateBlockDueDate } from "../api/blocks";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, parseISO, addWeeks, subWeeks, isWithinInterval, setHours, setMinutes, getHours, getDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";

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
        className={`transition-all duration-200 select-none group ${isDragging ? "opacity-80 scale-105 shadow-2xl z-50" : ""}`}
      >
        {/* ドラッグ中のオーバーレイ */}
        {isDragging && (
          <div className="absolute inset-0 bg-[var(--color-flist-accent)]/10 border-2 border-dashed border-[var(--color-flist-accent)] rounded-xl animate-pulse" />
        )}
        
        <div className={`relative ${isDragging ? "transform rotate-1" : ""}`}>
          {children}
        </div>
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
        className={`rounded-xl p-2 min-h-[80px] border text-left flex flex-col gap-1 transition-all duration-200 bg-white relative
          ${isToday ? "border-2 border-[var(--color-flist-accent)] bg-[var(--color-flist-blue-light)]/10" : "border border-[var(--color-flist-border)]"}
          ${isSelected ? "ring-2 ring-[var(--color-flist-accent)]" : ""}
          ${(isOver || isDropping) ? "ring-2 ring-[var(--color-flist-accent)] bg-[var(--color-flist-accent)]/10" : ""}
          hover:bg-[var(--color-flist-blue-light)]/5`}
        style={{ position: "relative" }}
        onClick={onClick}
      >
        {(isOver || isDropping) && (
          <div className="absolute inset-0 bg-[var(--color-flist-accent)]/5 border-2 border-dashed border-[var(--color-flist-accent)] rounded-xl animate-pulse" />
        )}
        
        {(isOver || isDropping) && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-[var(--color-flist-accent)] text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              Drop here
            </div>
          </div>
        )}
        
        <div className={`relative z-10 ${(isOver || isDropping) ? "opacity-50" : ""}`}>
          {children}
        </div>
      </div>
    );
  }

  // DnDハンドラ
  const handleDragStart = (event) => {
    if (event.active && event.active.data) {
      setActiveDrag(event.active.data.current);
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
      // タスクの中心がマウスカーソルの真下になるように補正
      // 詳細パネルが開いている場合は追加のオフセットを適用
      const detailPanelOffset = selectedBlockId ? 150 : 0;
      return {
        ...transform,
        x: transform.x - 200 - detailPanelOffset, // 基本オフセットをさらに大きくして詳細パネルが開いていない時のずれを修正
        y: transform.y - 25, // 上オフセット
      };
    },
  ];

  // 新しいタスクを作成して詳細パネルで表示
  const handleCreateNewTask = async (date) => {
    try {
      const newTask = await createTask("New Task");
      // 期日を設定
      const updatedTask = await updateBlockDueDate(newTask.id, date);
      const taskWithDueDate = { ...newTask, due_date: date };
      
      // タスクリストに追加
      setTasks((prev) => [...prev, taskWithDueDate]);
      
      // 詳細パネルで表示
      if (onSelectTask) onSelectTask(taskWithDueDate);
    } catch (e) {
      alert("タスク作成に失敗しました");
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-8 bg-[var(--color-flist-surface)] backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="ml-4 flex gap-2">
            <button
              className={`px-3 py-1 rounded-t-lg border-b-2 ${view === "month" ? "border-[var(--color-flist-accent)] text-[var(--color-flist-accent)] bg-white" : "border-transparent text-[var(--color-flist-muted)] bg-[var(--color-flist-surface)]"}`}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 rounded-t-lg border-b-2 ${view === "week" ? "border-[var(--color-flist-accent)] text-[var(--color-flist-accent)] bg-white" : "border-transparent text-[var(--color-flist-muted)] bg-[var(--color-flist-surface)]"}`}
              onClick={() => setView("week")}
            >
              Week
            </button>
          </div>
          <div className="ml-auto flex gap-2">
            {view === "month" ? (
              <>
                <button
                  className="px-2 py-1 rounded bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] border border-[var(--color-flist-border)] text-[var(--color-flist-dark)]"
                  onClick={() => setCurrentMonth(prev => addDays(startOfMonth(prev), -1))}
                >
                  &lt;
                </button>
                <span className="font-medium text-lg text-[var(--color-flist-dark)]">{format(currentMonth, "yyyy年 M月")}</span>
                <button
                  className="px-2 py-1 rounded bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] border border-[var(--color-flist-border)] text-[var(--color-flist-dark)]"
                  onClick={() => setCurrentMonth(prev => addDays(endOfMonth(prev), 1))}
                >
                  &gt;
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-2 py-1 rounded bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] border border-[var(--color-flist-border)] text-[var(--color-flist-dark)]"
                  onClick={() => setCurrentWeek(prev => subWeeks(prev, 1))}
                >
                  &lt;
                </button>
                <span className="font-medium text-lg text-[var(--color-flist-dark)]">{format(currentWeek, "yyyy年 M月 d日")} - {format(addDays(currentWeek, 6), "M月 d日")}</span>
                <button
                  className="px-2 py-1 rounded bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] border border-[var(--color-flist-border)] text-[var(--color-flist-dark)]"
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
            <div className="grid grid-cols-7 gap-px bg-[var(--color-flist-border)] rounded-xl overflow-hidden text-center text-xs font-semibold text-[var(--color-flist-accent)] mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="py-2 bg-white">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-[var(--color-flist-border)] rounded-xl overflow-hidden">
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
                  >
                    <div className={`flex items-center justify-between mb-1`}>
                      <span className={`text-xs font-bold ${isToday ? "text-[var(--color-flist-accent)]" : "text-[var(--color-flist-dark)]"}`}>{format(day, "d")}</span>
                      {isToday && <span className="ml-1 px-2 py-0.5 rounded-full bg-[var(--color-flist-accent)]/20 text-[var(--color-flist-accent)] text-[10px]">Today</span>}
                    </div>
                    <div className="flex flex-col gap-1 h-20 overflow-hidden">
                      {showTasks.map(task => (
                        <DraggableTask key={task.id} task={task}>
                          <div
                            className={`truncate text-xs px-2 py-1 rounded-xl border cursor-pointer transition-all duration-150 shadow-sm
                              ${selectedBlockId === task.id
                                ? "bg-gradient-to-r from-[var(--color-flist-accent)]/90 to-blue-400/80 text-white border-[var(--color-flist-accent)] shadow-lg"
                                : "bg-white text-[var(--color-flist-dark)] border-[var(--color-flist-border)] hover:bg-[var(--color-flist-blue-light)]/20 hover:border-[var(--color-flist-accent)]"
                            }`}
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
                      {/* 空の部分をクリックして新規追加 */}
                      <div 
                        className="flex-1 min-h-[20px] cursor-pointer hover:bg-[var(--color-flist-accent)]/5 rounded transition-colors"
                        onClick={() => {
                          handleCreateNewTask(dateKey);
                        }}
                      />
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
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectTask) onSelectTask(task);
                          }}
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
                  <th className="w-20 bg-[var(--color-flist-surface)]"></th>
                  {weekDays.map(day => (
                    <th key={format(day, "yyyy-MM-dd")}
                        className="text-center text-xs font-semibold py-2 bg-[var(--color-flist-surface)] border-b border-[var(--color-flist-border)]">
                      {format(day, "EEE d")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour, i) => (
                  <tr key={hour}>
                    <td className={`text-xs text-right pr-2 py-1 align-top bg-[var(--color-flist-surface)] border-b border-[var(--color-flist-border)] ${i === 0 ? "font-bold" : ""}`}>{hour === "All Day" ? "All Day" : `${hour}:00`}</td>
                    {weekDays.map(day => (
                      <td key={format(day, "yyyy-MM-dd") + hour}
                          className={`align-top border-b border-[var(--color-flist-border)] px-1 py-0.5 min-h-[32px] ${i === 0 ? "bg-[var(--color-flist-surface)]" : ""}`}>
                        <div className="flex flex-col gap-0.5">
                          {getTasksForCell(day, hour).map(task => (
                            <div
                              key={task.id}
                              className={`truncate text-xs px-1 py-0.5 rounded border cursor-pointer transition-colors ${
                                selectedBlockId === task.id
                                  ? "bg-[var(--color-flist-accent)] text-white border-[var(--color-flist-accent)]"
                                  : "bg-white text-[var(--color-flist-dark)] border-[var(--color-flist-border)] hover:bg-[var(--color-flist-blue-light)]/20"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectTask) onSelectTask(task);
                              }}
                            >
                              {task.html.replace(/^- \[[ xX]\] /, "")}<br/>
                              <span className="text-[10px] text-[var(--color-flist-muted)]">{hour === "All Day" ? format(parseISO(task.due_date), "yyyy-MM-dd") : format(parseISO(task.due_date), "HH:mm")}</span>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-flist-accent)]"></div>
          </div>
        )}
      </div>
      {/* DragOverlay: ドラッグ中はマウスに追従してタスクカードを表示 */}
      <DragOverlay dropAnimation={null} modifiers={overlayModifiers}>
        {draggingTask && (
          <div
            className="truncate text-xs px-4 py-2 rounded-xl border shadow-2xl bg-[var(--color-flist-accent)] text-white border-[var(--color-flist-accent)] opacity-90 scale-110 transition-all duration-150 z-50 select-none pointer-events-none transform rotate-2"
            style={{ minWidth: 120, maxWidth: 220 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="font-medium">
                {draggingTask.html.replace(/^- \[[ xX]\] /, "")}
              </span>
              <div className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                Moving...
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}