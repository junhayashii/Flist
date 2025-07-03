import { List, Calendar, Settings } from "lucide-react";

export default function AppLauncher({ selectedListId, setSelectedListId }) {
  return (
    <div className="flex flex-col justify-between items-center w-12 h-screen bg-[var(--color-flist-surface)] border-r border-[var(--color-flist-border)] py-4">
      <div className="flex flex-col gap-4 items-center">
        {/* List */}
        <button
          className={`p-2 rounded-lg transition-colors ${selectedListId === "tasks" ? "bg-[var(--color-flist-blue-light)] text-[var(--color-flist-accent)]" : "text-[var(--color-flist-muted)] hover:bg-[var(--color-flist-surface-hover)]"}`}
          onClick={() => setSelectedListId("tasks")}
          title="リスト"
        >
          <List className="w-6 h-6" />
        </button>
        {/* Calendar */}
        <button
          className={`p-2 rounded-lg transition-colors ${selectedListId === "calendar" ? "bg-[var(--color-flist-blue-light)] text-[var(--color-flist-accent)]" : "text-[var(--color-flist-muted)] hover:bg-[var(--color-flist-surface-hover)]"}`}
          onClick={() => setSelectedListId("calendar")}
          title="カレンダー"
        >
          <Calendar className="w-6 h-6" />
        </button>
      </div>
      <div className="flex flex-col gap-4 items-center">
        {/* Settings */}
        <button
          className="p-2 rounded-lg text-[var(--color-flist-muted)] hover:bg-[var(--color-flist-surface-hover)] transition-colors"
          title="設定"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
} 