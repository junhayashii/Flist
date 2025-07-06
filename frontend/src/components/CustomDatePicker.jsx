import { useState, useRef, useEffect } from "react";
import { CalendarDays, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

export default function CustomDatePicker({ value, onChange, open, setOpen }) {
  const [selected, setSelected] = useState(value ? new Date(value) : undefined);
  const ref = useRef();

  const setAndClose = (date) => {
    setSelected(date);
    onChange(date ? date.toISOString().slice(0, 10) : "");
    setOpen(false);
  };

  // Quick actions
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-full px-4 py-1 text-[var(--color-flist-dark)] text-sm font-medium shadow-sm hover:border-[var(--color-flist-accent)] transition-colors"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <CalendarDays className="w-4 h-4 text-[var(--color-flist-accent)]" />
        {selected ? formatDate(selected) : <span className="text-[var(--color-flist-muted)]">Set due date</span>}
        {selected && (
          <X
            className="w-3 h-3 ml-2 text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)]"
            onClick={e => { e.stopPropagation(); setAndClose(undefined); }}
          />
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 left-0 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-xl shadow-xl p-4 min-w-[320px]">
          <div className="flex flex-col gap-2 mb-2">
            <button
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--color-flist-blue-light)] text-left"
              onClick={() => setAndClose(today)}
              type="button"
            >
              <CalendarDays className="w-4 h-4 text-[var(--color-flist-accent)]" />
              Today
            </button>
            <button
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--color-flist-blue-light)] text-left"
              onClick={() => setAndClose(tomorrow)}
              type="button"
            >
              <CalendarDays className="w-4 h-4 text-[var(--color-flist-accent)]" />
              Tomorrow
            </button>
            <button
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--color-flist-blue-light)] text-left"
              onClick={() => setAndClose(nextWeek)}
              type="button"
            >
              <CalendarDays className="w-4 h-4 text-[var(--color-flist-accent)]" />
              Next week
            </button>
          </div>
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={setAndClose}
            modifiersClassNames={{
              selected: "bg-[var(--color-flist-accent)] text-white",
              today: "border border-[var(--color-flist-accent)]",
            }}
            className="!bg-transparent"
          />
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-1 rounded border border-[var(--color-flist-border)] text-[var(--color-flist-muted)] hover:bg-[var(--color-flist-blue-light)]"
              onClick={() => setAndClose(undefined)}
              type="button"
            >
              Clear
            </button>
            <button
              className="px-4 py-1 rounded bg-[var(--color-flist-accent)] text-white font-semibold"
              onClick={() => setOpen(false)}
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 