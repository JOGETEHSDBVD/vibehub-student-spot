import { LayoutDashboard, Users, CalendarDays, CalendarCheck, History, BarChart3, Megaphone, Settings, LogOut, QrCode, Image } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import logoBlue from "@/assets/logo-blue.png";

const AdminSidebar = () => {
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: t("admin.dashboard"), icon: LayoutDashboard, path: "/admin" },
    { label: t("admin.members"), icon: Users, path: "/admin/members" },
    { label: t("admin.yourEvents"), icon: CalendarDays, path: "/admin/events" },
    { label: t("admin.activeEvents"), icon: CalendarCheck, path: "/admin/active-events" },
    { label: t("admin.pastEvents"), icon: History, path: "/admin/past-events" },
    { label: t("admin.qrScanner"), icon: QrCode, path: "/admin/scan-qr" },
    { label: t("admin.analytics"), icon: BarChart3, path: "/admin/analytics" },
    { label: t("admin.announcements"), icon: Megaphone, path: "/admin/announcements" },
    { label: t("admin.galleryManager"), icon: Image, path: "/admin/gallery" },
  ];

  const handleExit = () => {
    navigate("/events");
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-3 px-5 py-5">
        <img src={logoBlue} alt="VibeHub Logo" className="h-10 w-auto object-contain" />
        <div>
          <p className="text-sm font-bold text-foreground">VibeHub Club</p>
          <p className="text-xs text-muted-foreground">{t("admin.panel")}</p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const currentPath = location.pathname.replace(/\/$/, '') || '/';
          const itemPath = item.path.replace(/\/$/, '') || '/';
          const isActive = currentPath === itemPath;
          return (
            <button
              key={item.path}
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

      <div className="border-t border-border px-3 py-3">
        {(() => {
          const settingsActive = (location.pathname.replace(/\/$/, '') || '/') === '/admin/settings';
          return (
            <button
              onClick={() => navigate("/admin/settings")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                settingsActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings size={18} />
              {t("admin.settings")}
            </button>
          );
        })()}
      </div>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
              {profile?.full_name?.[0] ?? "A"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{profile?.full_name ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground">{t("admin.superAdmin")}</p>
          </div>
          <button onClick={handleExit} title={t("admin.backToSite")} className="text-muted-foreground hover:text-foreground">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
