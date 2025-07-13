import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { X, Sliders, Bell, Link2, Settings as Cog, Star, User } from "lucide-react";

// Settings sections with icons (General first)
const SECTIONS = [
  { key: "general", label: "General", icon: <Cog className="w-4 h-4 mr-2" /> },
  { key: "accounts", label: "Accounts", icon: <User className="w-4 h-4 mr-2" /> },
  { key: "preferences", label: "Preferences", icon: <Sliders className="w-4 h-4 mr-2" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4 mr-2" /> },
  { key: "connections", label: "Connections", icon: <Link2 className="w-4 h-4 mr-2" /> },
  { key: "upgrade", label: "Upgrade Plan", icon: <Star className="w-4 h-4 mr-2 text-yellow-400" /> },
];

/**
 * SettingsModal
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 */
export default function SettingsModal({ open, onClose }) {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].key);
  const modalRef = useRef(null);
  const { user } = useAuth();

  // Close on ESC key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[5px] transition-all"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl mx-4 md:mx-8 md:w-[1100px] bg-white/80 dark:bg-neutral-900/80 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fadeIn border border-[var(--color-flist-border)] min-h-[700px]"
      >
        {/* Sidebar - styled to match app's list sidebar */}
        <nav className="w-full md:w-72 bg-[var(--color-flist-surface)] border-r border-[var(--color-flist-border)] flex-shrink-0 flex flex-row md:flex-col py-4">
          <div className="flex flex-col gap-1 w-full px-4">
            {SECTIONS.map((section) => (
              <button
                key={section.key}
                className={`w-full flex items-center gap-2 px-6 py-2 rounded-lg text-base font-medium transition-all duration-200 hover-lift focus:outline-none focus:bg-[var(--color-flist-surface-hover)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)] text-left ${
                  activeSection === section.key
                    ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] shadow-sm"
                    : "text-[var(--color-flist-text-secondary)]"
                }`}
                onClick={() => setActiveSection(section.key)}
                aria-current={activeSection === section.key ? "page" : undefined}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area - fixed size, always same for all sections */}
        <section className="flex-1 flex items-center justify-center min-h-[600px] relative bg-white/70 dark:bg-neutral-900/70">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>

          {/* All sections: show 'Upcoming...' message with icon */}
          <div className="flex flex-col items-center justify-center w-full">
            {activeSection === "accounts" && (
              <>
                <User className="w-12 h-12 mb-4 text-[var(--color-flist-primary)] opacity-80" />
                <h2 className="text-2xl font-bold mb-2">Accounts</h2>
                <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col items-center">
                  <div className="w-full mb-4">
                    <label className="text-xs font-semibold text-gray-500 ml-1 mb-1">Email</label>
                    <div className="w-full px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-base border border-gray-200">
                      {user?.email || <span className="text-gray-400">(not available)</span>}
                    </div>
                  </div>
                </div>
              </>
            )}
            {activeSection === "preferences" && (
              <>
                <Sliders className="w-12 h-12 mb-4 text-[var(--color-flist-primary)] opacity-80" />
                <h2 className="text-2xl font-bold mb-2">Preferences</h2>
                <p className="text-lg text-gray-500">Upcoming...</p>
              </>
            )}
            {activeSection === "notifications" && (
              <>
                <Bell className="w-12 h-12 mb-4 text-[var(--color-flist-primary)] opacity-80" />
                <h2 className="text-2xl font-bold mb-2">Notifications</h2>
                <p className="text-lg text-gray-500">Upcoming...</p>
              </>
            )}
            {activeSection === "connections" && (
              <>
                <Link2 className="w-12 h-12 mb-4 text-[var(--color-flist-primary)] opacity-80" />
                <h2 className="text-2xl font-bold mb-2">Connections</h2>
                <p className="text-lg text-gray-500">Upcoming...</p>
              </>
            )}
            {activeSection === "general" && (
              <>
                <Cog className="w-12 h-12 mb-4 text-[var(--color-flist-primary)] opacity-80" />
                <h2 className="text-2xl font-bold mb-2">General</h2>
                <p className="text-lg text-gray-500">Upcoming...</p>
              </>
            )}
            {activeSection === "upgrade" && (
              <>
                <Star className="w-12 h-12 mb-4 text-yellow-400 opacity-80" />
                <h2 className="text-2xl font-bold mb-2">Upgrade Plan</h2>
                <p className="text-lg text-gray-500">Upcoming...</p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
