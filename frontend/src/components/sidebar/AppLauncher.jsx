import { List, Calendar, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function AppLauncher({ selectedListId, setSelectedListId }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  return (
    <div className="flex flex-col justify-between items-center w-14 h-screen bg-[var(--color-flist-surface)] border-r border-[var(--color-flist-border)] py-6 glass">
      <div className="flex flex-col gap-3 items-center">
        {/* App Logo */}
        <div className="mb-4">
          <div className="w-8 h-8 bg-[var(--color-flist-primary)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
        </div>
        
        {/* List */}
        <button
          className={`p-3 rounded-lg transition-all duration-200 hover-scale focus-ring ${
            selectedListId === "tasks" 
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
      
      <div className="flex flex-col gap-3 items-center">
        {/* User Avatar */}
        <div className="w-8 h-8 bg-[var(--color-flist-primary)] rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        
        {/* Settings */}
        <button
          className="p-3 rounded-lg text-[var(--color-flist-text-muted)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)] transition-all duration-200 hover-scale focus-ring"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-3 rounded-lg text-[var(--color-flist-text-muted)] hover:bg-[var(--color-flist-error-light)] hover:text-[var(--color-flist-error)] transition-all duration-200 hover-scale focus-ring"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 