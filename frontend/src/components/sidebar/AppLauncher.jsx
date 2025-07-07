import { List, Calendar, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";

export default function AppLauncher({ selectedListId, setSelectedListId, openSettings }) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await logout();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  // Calculate menu position when opening
  useEffect(() => {
    if (menuOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      // Calculate desired top position (higher up)
      let top = rect.top - 32; // 32px above the avatar
      if (top < 16) top = 16; // Clamp to at least 16px from top
      setMenuPosition({
        top,
        left: rect.right + 16 // to the right of the sidebar
      });
    }
  }, [menuOpen]);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(e.target) &&
        !document.getElementById("app-launcher-menu")?.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Dropdown menu component rendered in portal
  const menu = menuOpen
    ? ReactDOM.createPortal(
        <div
          id="app-launcher-menu"
          className="fixed z-[100] min-w-[160px] bg-white border border-[var(--color-flist-border)] rounded-xl shadow-2xl py-2 animate-fadeIn"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
          role="menu"
          aria-label="Account menu"
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-[var(--color-flist-text-primary)] hover:bg-[var(--color-flist-surface-hover)] rounded-lg transition-colors"
            onClick={() => { setMenuOpen(false); openSettings(); }}
            role="menuitem"
          >
            Settings
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-[var(--color-flist-error)] hover:bg-[var(--color-flist-error-light)] rounded-lg transition-colors"
            onClick={() => { setMenuOpen(false); handleLogout(); }}
            role="menuitem"
          >
            Logout
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="flex flex-col justify-between items-center w-14 h-screen bg-[var(--color-flist-surface)] border-r border-[var(--color-flist-border)] py-6 glass">
        <div className="flex flex-col gap-3 items-center">
          {/* App Logo */}
          <div className="mb-2">
            <img src="/flist-icon.png" alt="Flist Logo" className="w-8 h-8 rounded-lg" />
          </div>
          {/* List */}
          <button
            className={`p-3 rounded-lg transition-all duration-200 hover-scale focus-ring ${
              selectedListId && selectedListId !== "calendar"
                ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] shadow-sm" 
                : "text-[var(--color-flist-text-muted)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)]"
            }`}
            onClick={() => setSelectedListId("tasks")}
            title="Tasks"
          >
            <List className="w-5 h-5" />
          </button>
          {/* Calendar */}
          <button
            className={`p-3 rounded-lg transition-all duration-200 hover-scale focus-ring ${
              selectedListId === "calendar" 
                ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] shadow-sm" 
                : "text-[var(--color-flist-text-muted)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)]"
            }`}
            onClick={() => setSelectedListId("calendar")}
            title="Calendar"
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3 items-center relative">
          {/* User Avatar as menu trigger */}
          <button
            ref={avatarRef}
            className="w-8 h-8 bg-white border border-[var(--color-flist-border)] rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors hover:bg-[var(--color-flist-primary-light)]"
            onClick={() => setMenuOpen((v) => !v)}
            title="Account"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <User className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      {menu}
    </>
  );
} 