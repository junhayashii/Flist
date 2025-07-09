import React, { useEffect, useState, useRef } from "react";
import { fetchTasks, deleteBlock, updateBlock } from "../api/blocks";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameDay, parseISO, addWeeks, subWeeks, getHours, addMonths, subMonths, isSameMonth } from "date-fns";
import { DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

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

// ミニカレンダーコンポーネント
function MiniCalendar({ currentMonth, onDateSelect, selectedDate, tasksByDate }) {
  const [miniMonth, setMiniMonth] = useState(currentMonth);
  
  // 選択された日付を更新
  useEffect(() => {
    setMiniMonth(currentMonth);
  }, [currentMonth]);

  const miniWeeks = getMonthMatrix(miniMonth);
  const today = new Date();

  const handleDateClick = (date) => {
    onDateSelect(date);
  };

  const handlePrevMonth = () => {
    setMiniMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setMiniMonth(prev => addMonths(prev, 1));
  };

  const handleTodayClick = () => {
    const today = new Date();
    setMiniMonth(today);
    onDateSelect(today);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-flist-border)]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-medium text-[var(--color-flist-dark)]">
          {format(miniMonth, "yyyy年 M月")}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Today ボタン */}
      <button
        onClick={handleTodayClick}
        className="w-full mb-3 px-3 py-1.5 text-xs font-medium bg-[var(--color-flist-accent)] text-white rounded-lg hover:bg-[var(--color-flist-accent-hover)] transition-colors"
      >
        Today
      </button>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {['S','M','T','W','T','F','S'].map((day, i) => (
          <div key={day + '-' + i} className="text-center text-xs font-medium text-[var(--color-flist-muted)] py-1">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-px">
        {miniWeeks.flat().map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, miniMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          // Show dot only if there are incomplete tasks (type === 'task')
          const hasIncompleteTasks = tasksByDate[dateKey] && tasksByDate[dateKey].some(task => task.type === 'task');
          
          return (
            <button
              key={dateKey}
              onClick={() => handleDateClick(day)}
              className={`
                relative w-8 h-8 text-xs rounded-lg transition-all duration-150 flex items-center justify-center
                ${isCurrentMonth 
                  ? "text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-blue-light)]/20" 
                  : "text-[var(--color-flist-muted)]/50"
                }
                ${isToday 
                  ? "bg-[var(--color-flist-accent)] text-white font-bold" 
                  : ""
                }
                ${isSelected && !isToday 
                  ? "bg-[var(--color-flist-accent)]/20 text-[var(--color-flist-accent)] font-medium ring-2 ring-[var(--color-flist-accent)]" 
                  : ""
                }
              `}
            >
              {format(day, "d")}
              {/* Incomplete task indicator dot */}
              {hasIncompleteTasks && !isToday && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[var(--color-flist-accent)] rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage({ onSelectTask, selectedBlockId, refreshKey }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [view, setView] = useState("month"); // "month" or "week"
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [modalTasks, setModalTasks] = useState([]);
  const [modalDate, setModalDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, task: null });
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  // Add state for modal position:
  const [modalPosition, setModalPosition] = useState({ top: null, left: null });
  // Ref for the show more modal
  const showMoreModalRef = useRef(null);
  // Local checked state for tasks
  // Remove local checkedTasks state and handler

  // Handler for checkbox toggle
  const handleTaskCheckbox = async (task) => {
    const newType = task.type === "task-done" ? "task" : "task-done";
    const newHtml = (newType === "task-done" ? "- [x] " : "- [ ] ") + (task.html || "").replace(/^- \[[ xX]\] /, "");
    const updatedTask = { ...task, type: newType, html: newHtml };
    // Optimistically update UI
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    // Update backend
    await updateBlock(updatedTask);
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('taskUpdated', { detail: updatedTask }));
  };

  // 親からのrefreshKeyまたはwindowイベントでリフレッシュ
  useEffect(() => {
    setLocalRefreshKey(k => k + 1);
  }, [refreshKey]);
  useEffect(() => {
    const handler = () => setLocalRefreshKey(k => k + 1);
    window.addEventListener('taskUpdated', handler);
    return () => window.removeEventListener('taskUpdated', handler);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const allTasks = await fetchTasks();
        setTasks(allTasks);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [localRefreshKey]);

  // 日付ごとにタスクをグループ化（ローカル日付で）
  const tasksByDate = {};
  tasks.forEach(task => {
    if (!task.due_date) return;
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
  const totalCalendarHeight = 740; // px, increased for more height
  const cellHeight = totalCalendarHeight / weeks.length;

  // ドラッグ用ラッパー
  function DraggableTask({ task, children }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `task-${task.id}`,
      data: {
        taskId: task.id,
        fromDate: task.due_date ? format(parseISO(task.due_date), "yyyy-MM-dd") : null,
      },
    });
    // クリックとドラッグの両立: isDragging中はonClick無効
    const handleClick = () => {
      if (isDragging) return;
      if (onSelectTask) onSelectTask(task);
    };
    // 右クリックでカスタムメニュー
    const handleContextMenu = (e) => {
      e.preventDefault();
      setContextMenu({ visible: true, x: e.pageX, y: e.pageY, task });
    };
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{ cursor: "grab" }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`transition-all duration-200 select-none group ${
          isDragging 
            ? "opacity-80 scale-110 shadow-2xl z-50 rotate-2" 
            : "hover:scale-105 hover:shadow-lg"
        }`}
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
  function DroppableDateCell({ date, isOver, isToday, isSelected, children, onClick, cellHeight }) {
    const { setNodeRef, isOver: isDropping } = useDroppable({
      id: `date-${format(date, "yyyy-MM-dd")}`,
      data: { date: format(date, "yyyy-MM-dd") },
    });
    return (
      <div
        ref={setNodeRef}
        className={`calendar-square-cell border border-[var(--color-flist-border)] bg-white flex flex-col transition-all duration-200 relative
          ${(isOver || isDropping) ? "ring-2 ring-[var(--color-flist-accent)] bg-[var(--color-flist-accent)]/10" : ""}
          hover:bg-[var(--color-flist-blue-light)]/5`}
        style={{ position: "relative", width: '100%', height: cellHeight ? `${cellHeight}px` : undefined, minHeight: 0, maxHeight: 'none', padding: 0 }}
        onClick={onClick}
      >
        {(isOver || isDropping) && (
          <div className="absolute inset-0 bg-[var(--color-flist-accent)]/5 border-2 border-dashed border-[var(--color-flist-accent)] animate-pulse" style={{ borderRadius: 0 }} />
        )}
        {(isOver || isDropping) && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-[var(--color-flist-accent)] text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              Drop here
            </div>
          </div>
        )}
        <div className={`relative z-10 ${(isOver || isDropping) ? "opacity-50" : ""}`} style={{ padding: 4 }}>
          {children}
        </div>
      </div>
    );
  }

  // 日付選択ハンドラー
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (view === "month") {
      setCurrentMonth(date);
    } else {
      setCurrentWeek(startOfWeek(date, { weekStartsOn: 0 }));
    }
  };

  // 新しいタスクを作成して詳細パネルで表示
  const handleCreateNewTask = async (date) => {
    try {
      const { createTask, updateBlockDueDate } = await import("../api/blocks");
      const newTask = await createTask("New Task");
      await updateBlockDueDate(newTask.id, date);
      const taskWithDueDate = { ...newTask, due_date: date };
      setTasks((prev) => [...prev, taskWithDueDate]);
      if (onSelectTask) onSelectTask(taskWithDueDate);
    } catch {
      alert("タスク作成に失敗しました");
    }
  };

  // タスク削除ハンドラ
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("このタスクを削除しますか？")) return;
    await deleteBlock(taskId);
    setTasks((prev) => prev.filter(t => t.id !== taskId));
    setContextMenu({ visible: false, x: 0, y: 0, task: null });
  };

  // 右クリックメニューの描画
  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, task: null });
    if (contextMenu.visible) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [contextMenu.visible]);

  const renderContextMenu = () => {
    if (!contextMenu.visible || !contextMenu.task) return null;
    // スクロール量を加味
    const top = contextMenu.y - window.scrollY;
    const left = contextMenu.x - window.scrollX;
    return createPortal(
      <div
        style={{ position: "fixed", top, left, zIndex: 10000 }}
        className="bg-white border border-gray-300 rounded shadow-lg py-1 px-2 min-w-[120px]"
      >
        <button
          className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
          onClick={() => handleDeleteTask(contextMenu.task.id)}
        >
          削除
        </button>
      </div>,
      document.body
    );
  };

  // Close show more modal when clicking outside
  useEffect(() => {
    if (!showMoreModal) return;
    function handleClickOutside(event) {
      if (showMoreModalRef.current && !showMoreModalRef.current.contains(event.target)) {
        setShowMoreModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreModal]);

  return (
    <>
      <div className="p-8 mx-8 space-y-8">
        {/* Header with Title */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-[var(--color-flist-dark)]">Calendar</h1>
          <div className="flex gap-2 items-center">
            <button
              className="px-3 py-1 rounded bg-[var(--color-flist-accent)] text-white font-medium hover:bg-[var(--color-flist-accent-hover)] transition-colors"
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentMonth(today);
              }}
            >
              Today
            </button>
            {/* Remove view switcher and week navigation */}
            <button
              className="px-2 py-1 rounded bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] border border-[var(--color-flist-border)] text-[var(--color-flist-dark)]"
              onClick={() => setCurrentMonth(prev => addDays(startOfMonth(prev), -1))}
            >
              &lt;
            </button>
            <span className="font-medium text-lg text-[var(--color-flist-dark)]">{format(currentMonth, "MMM yyyy")}</span>
            <button
              className="px-2 py-1 rounded bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] border border-[var(--color-flist-border)] text-[var(--color-flist-dark)]"
              onClick={() => setCurrentMonth(prev => addDays(endOfMonth(prev), 1))}
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="flex flex-col w-full">
          {/* Controls above the card, no extra gap */}
          <div className="w-full flex items-center justify-between">
            {/* Main calendar card, remove p-6 padding */}
            <div className="flex-1 bg-white rounded-xl shadow-lg backdrop-blur-md mt-6">
              {/* Only keep the month view */}
              <>
                <div className="grid grid-cols-7 gap-px bg-[var(--color-flist-border)] rounded-t-xl" style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden' }}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="py-2 bg-white text-center flex items-center justify-center border border-[var(--color-flist-border)]" style={{ borderRadius: 0 }}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-px bg-[var(--color-flist-border)] rounded-b-xl" style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden' }}>
                  {weeks.flat().map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const tasksForDay = tasksByDate[dateKey] || [];
                    const maxShow = 3;
                    const showTasks = tasksForDay.slice(0, maxShow);
                    const moreCount = tasksForDay.length - maxShow;
                    const isOver = false;
                    return (
                      <DroppableDateCell
                        key={dateKey}
                        date={day}
                        isOver={isOver}
                        isToday={isToday}
                        isSelected={isSelected}
                        onClick={e => {
                          // Prevent adding a task if clicking on a task or the more button
                          if (
                            e.target.closest('.calendar-task') ||
                            e.target.closest('.calendar-more-btn')
                          ) return;
                          handleCreateNewTask(dateKey);
                        }}
                        cellHeight={cellHeight}
                      >
                        <div className="flex flex-col items-center mb-1 gap-1">
                          {isToday ? (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white font-bold">{format(day, "d")}</span>
                          ) : (
                            <span className={`flex items-center justify-center w-5 h-5 text-xs font-bold ${isSelected ? "text-[var(--color-flist-accent)]" : "text-[var(--color-flist-dark)]"}`}>{format(day, "d")}</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 w-full overflow-hidden">
                          {showTasks.map(task => (
                            <DraggableTask key={task.id} task={task}>
                              <div
                                className={`truncate text-xs px-2 py-1 rounded-lg border cursor-pointer transition-all duration-150 shadow-sm bg-white hover:bg-[var(--color-flist-blue-light)]/20 border-[var(--color-flist-border)] text-[var(--color-flist-dark)] ${selectedBlockId === task.id ? "bg-gradient-to-r from-[var(--color-flist-accent)]/90 to-blue-400/80 text-white border-[var(--color-flist-accent)] shadow-lg" : ""} calendar-task flex items-center gap-2`}
                              >
                                <input
                                  type="checkbox"
                                  checked={task.type === "task-done"}
                                  onChange={() => handleTaskCheckbox(task)}
                                  className="mr-1 accent-[var(--color-flist-accent)]"
                                  onClick={e => e.stopPropagation()}
                                />
                                <span className={task.type === "task-done" ? "line-through text-gray-400" : ""}>
                                  {(task.html || "").replace(/^- \[[ xX]\] /, "")}
                                </span>
                              </div>
                            </DraggableTask>
                          ))}
                          {moreCount > 0 && (
                            <button
                              className="text-xs text-[var(--color-flist-accent)] hover:underline mt-1 px-2 py-0.5 rounded bg-[var(--color-flist-accent)]/10 hover:bg-[var(--color-flist-accent)]/30 transition-colors calendar-more-btn"
                              onClick={e => {
                                const rect = e.target.getBoundingClientRect();
                                setModalTasks(tasksForDay);
                                setModalDate(dateKey);
                                setShowMoreModal(true);
                                const MODAL_HEIGHT = 320; // match modal's maxHeight
                                const MODAL_WIDTH = 320; // match modal's maxWidth
                                setModalPosition({
                                  top: rect.top + window.scrollY - MODAL_HEIGHT - 50, // 8px above the button
                                  left: rect.left + window.scrollX - MODAL_WIDTH - 120 // center horizontally
                                });
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
                  <div
                    ref={showMoreModalRef}
                    className="z-50"
                    style={{
                      position: 'absolute',
                      top: modalPosition.top,
                      left: modalPosition.left,
                      minWidth: 280,
                      maxWidth: 320,
                      width: '100%',
                      pointerEvents: 'auto',
                    }}
                  >
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-[var(--color-flist-border)] flex flex-col items-center relative">
                      <button className="absolute top-3 right-3 text-gray-400 hover:text-[var(--color-flist-accent)] text-xl" onClick={() => setShowMoreModal(false)}>&times;</button>
                      <div className="text-center w-full mb-2">
                        <div className="text-[var(--color-flist-muted)] text-sm font-medium mb-1">{format(parseISO(modalDate), 'E', { locale: undefined })}</div>
                        <div className="text-3xl font-bold text-[var(--color-flist-dark)]">{format(parseISO(modalDate), 'd')}</div>
                      </div>
                      <div className="flex flex-col gap-2 w-full mt-2">
                        {modalTasks.map(task => (
                          <DraggableTask key={task.id} task={task}>
                            <div
                              className="w-full px-4 py-2 rounded-xl bg-[#b7a6e7] text-white text-sm font-medium text-left truncate shadow-sm flex items-center gap-2"
                              onClick={() => {
                                if (onSelectTask) onSelectTask(task);
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={task.type === "task-done"}
                                onChange={() => handleTaskCheckbox(task)}
                                className="mr-1 accent-[var(--color-flist-accent)]"
                                onClick={e => e.stopPropagation()}
                              />
                              <span className={task.type === "task-done" ? "line-through text-gray-200" : ""}>
                                {(task.html || '').replace(/^- \[[ xX]\] /, '') || '(タイトルなし)'}
                              </span>
                            </div>
                          </DraggableTask>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
              {loading && (
                <div className="flex items-center justify-center mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-flist-accent)]"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {renderContextMenu()}
    </>
  );
}