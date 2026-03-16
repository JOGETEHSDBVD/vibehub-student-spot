import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Download, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCards from "@/components/admin/StatsCards";
import RecentMembers from "@/components/admin/RecentMembers";
import QuickActions from "@/components/admin/QuickActions";
import UpcomingEventsPanel from "@/components/admin/UpcomingEventsPanel";
import EventFormModal from "@/components/admin/EventFormModal";

const Admin = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user) navigate("/");
      else if (!isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Executive Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of VibeHub's Sports, Culture, and Entrepreneurship wings.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download size={16} /> Export Report
            </Button>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setEventFormOpen(true)}>
              <PlusCircle size={16} /> Create Event
            </Button>
          </div>
        </div>

        <StatsCards key={refreshKey} />

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentMembers />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <UpcomingEventsPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
