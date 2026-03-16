import { LayoutDashboard, Users, CalendarDays, BarChart3, Megaphone, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Members", icon: Users, path: "/admin/members" },
  { label: "Events", icon: CalendarDays, path: "/admin/events" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Announcements", icon: Megaphone, path: "/admin/announcements" },
];

const AdminSidebar = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Users size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">VibeHub Club</p>
          <p className="text-xs text-muted-foreground">ADMIN PANEL</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const currentPath = location.pathname.replace(/\/$/, '') || '/';
          const itemPath = item.path.replace(/\/$/, '') || '/';
          const isActive = currentPath === itemPath;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          <Settings size={18} />
          Settings
        </button>
      </div>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {profile?.full_name?.[0] ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{profile?.full_name ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
          <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
