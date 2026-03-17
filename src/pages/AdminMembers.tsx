import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield } from "lucide-react";
import MemberActionsMenu from "@/components/admin/MemberActionsMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  isAdmin: boolean;
  is_banned: boolean;
}

const PAGE_SIZE = 10;

const AdminMembers = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchMembers = async () => {
      setFetching(true);
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminIds = new Set((adminRoles ?? []).map((r) => r.user_id));

      let query = supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, created_at, is_banned", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, count } = await query;
      setMembers(
        (data ?? []).map((p: any) => ({ ...p, isAdmin: adminIds.has(p.id), is_banned: p.is_banned ?? false }))
      );
      setTotal(count ?? 0);
      setFetching(false);
    };
    fetchMembers();
  }, [isAdmin, search, page, refreshKey]);

  const refreshMembers = () => setRefreshKey((k) => k + 1);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const avatarColors = [
    "bg-rose-200", "bg-amber-200", "bg-sky-200", "bg-emerald-200",
    "bg-violet-200", "bg-pink-200", "bg-teal-200", "bg-orange-200",
  ];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground">Manage all VibeHub members.</p>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold text-foreground">All Members ({total})</h3>
            <div className="relative w-full sm:w-56">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-xs font-semibold uppercase text-muted-foreground">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Loading members...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">No members found.</td></tr>
                ) : (
                  members.map((m, i) => (
                    <tr key={m.id} className={`border-t border-border ${m.isAdmin ? "bg-primary/5" : ""}`}>
                      <td className="flex items-center gap-3 px-5 py-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarColors[i % avatarColors.length]} text-sm font-bold`}>
                          {(m.full_name ?? m.email ?? "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{m.full_name || m.email || "Unknown"}</span>
                          {m.email && <p className="text-xs text-muted-foreground">{m.email}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {m.isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                            <Shield size={10} /> Admin
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Member</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{m.isAdmin ? "Administration" : "General"}</td>
                      <td className="px-5 py-3">
                        {m.is_banned ? (
                          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">BANNED</span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">ACTIVE</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(m.created_at)}</td>
                      <td className="px-5 py-3">
                        <MemberActionsMenu member={m} onRefresh={refreshMembers} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">Showing {members.length} of {total} members</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminMembers;
