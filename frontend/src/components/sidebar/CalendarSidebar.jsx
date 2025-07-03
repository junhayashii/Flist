import { useEffect, useState } from "react";
import { fetchTasks } from "../../api/blocks";
import { format, isSameDay, isSameMonth, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DndContext, useDraggable } from "@dnd-kit/core";

function getMonthMatrix(currentMonth) {
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
}

function MiniCalendar({ currentMonth, onDateSelect, selectedDate, tasksByDate }) {
  const [miniMonth, setMiniMonth] = useState(currentMonth);
  useEffect(() => { setMiniMonth(currentMonth); }, [currentMonth]);
  const miniWeeks = getMonthMatrix(miniMonth);
  const today = new Date();
  return (
    <div className="rounded-lg px-2 pt-2 pb-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setMiniMonth(prev => subMonths(prev, 1))} className="p-1 rounded hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)] transition-colors"><ChevronLeft size={16} /></button>
        <div className="text-xs font-semibold text-[var(--color-flist-dark)]">{format(miniMonth, "yyyy年 M月")}</div>
        <button onClick={() => setMiniMonth(prev => addMonths(prev, 1))} className="p-1 rounded hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)] transition-colors"><ChevronRight size={16} /></button>
      </div>
      <button onClick={() => { setMiniMonth(today); onDateSelect(today); }} className="w-full mb-2 px-2 py-1 text-xs font-medium text-[var(--color-flist-accent)] bg-transparent rounded hover:bg-[var(--color-flist-surface-hover)] transition-colors">Today</button>
      <div className="grid grid-cols-7 gap-px mb-1">
        {['S','M','T','W','T','F','S'].map((day, i) => (
          <div key={day + '-' + i} className="text-center text-[10px] font-medium text-[var(--color-flist-muted)] py-0.5">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {miniWeeks.flat().map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, miniMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasTasks = tasksByDate[dateKey] && tasksByDate[dateKey].length > 0;
          return (
            <button
              key={dateKey}
              onClick={() => onDateSelect(day)}
              className={`relative w-7 h-7 text-xs rounded-md flex items-center justify-center transition-all duration-150
                ${isCurrentMonth ? "text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-blue-light)]/20" : "text-[var(--color-flist-muted)]/50"}
                ${isToday ? "bg-[var(--color-flist-accent)] text-white font-bold" : ""}
                ${isSelected && !isToday ? "bg-[var(--color-flist-accent)]/20 text-[var(--color-flist-accent)] font-medium ring-2 ring-[var(--color-flist-accent)]" : ""}
              `}
              style={{margin: 0, padding: 0}}
            >
              {format(day, "d")}
              {hasTasks && !isToday && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[var(--color-flist-accent)] rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// DraggableTask: 日付なしタスク用
function DraggableTask({ task, children }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: {
      taskId: task.id,
      fromDate: null, // 日付なし
    },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ cursor: "grab" }}
      className={`transition-all duration-200 select-none group ${
        isDragging 
          ? "opacity-80 scale-110 shadow-2xl z-50 rotate-2" 
          : "hover:scale-105 hover:shadow-lg"
      }`}
    >
      {children}
    </div>
  );
}

export default function CalendarSidebar({ setSelectedTask, refreshKey }) {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  useEffect(() => {
    fetchTasks().then(setTasks);
  }, [refreshKey]);
  useEffect(() => {
    const handler = () => fetchTasks().then(setTasks);
    window.addEventListener('taskUpdated', handler);
    return () => window.removeEventListener('taskUpdated', handler);
  }, []);
  // 日付ごとにタスクをグループ化
  const tasksByDate = {};
  tasks.forEach(task => {
    if (!task.due_date) return;
    const dateKey = format(parseISO(task.due_date), "yyyy-MM-dd");
    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push(task);
  });
  return (
    <div className="w-64 h-full bg-[var(--color-flist-surface)] border-r border-[var(--color-flist-border)] p-4 space-y-4 overflow-y-auto">
      <MiniCalendar currentMonth={currentMonth} onDateSelect={date => { setSelectedDate(date); setCurrentMonth(date); }} selectedDate={selectedDate} tasksByDate={tasksByDate} />
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-[var(--color-flist-muted)] mb-2 pl-1">日付なしタスク</h3>
        <div className="space-y-1">
          {tasks.filter(task => !task.due_date).length > 0 ? (
            tasks.filter(task => !task.due_date).map(task => (
              <DraggableTask key={task.id} task={task}>
                <div
                  className="px-3 py-2 rounded-lg text-sm text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)] cursor-pointer transition-colors truncate"
                  title={(task.html || "").replace(/^- \[[ xX]\] /, "")}
                  onClick={() => setSelectedTask && setSelectedTask(task)}
                >
                  {(task.html || "").replace(/^- \[[ xX]\] /, "")}
                </div>
              </DraggableTask>
            ))
          ) : (
            <div className="text-xs text-[var(--color-flist-muted)] text-center py-4">日付なしタスクはありません</div>
          )}
        </div>
      </div>
    </div>
  );
} 