import { useEffect, useState } from "react";
import { Search, Shield, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import MemberActionsMenu from "@/components/admin/MemberActionsMenu";
import { useNavigate } from "react-router-dom";

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  isAdmin: boolean;
  isScanner: boolean;
  is_banned: boolean;
}

const RecentMembers = () => {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshMembers = () => setRefreshKey((k) => k + 1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "scanner"] as any[]);
      const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
      const scannerIds = new Set((roles ?? []).filter((r) => r.role === "scanner").map((r) => r.user_id));

      let query = supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, created_at, is_banned", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, 9);

      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, count } = await query;

      setMembers(
        (data ?? []).map((p: any) => ({
          ...p,
          isAdmin: adminIds.has(p.id),
          isScanner: scannerIds.has(p.id),
          is_banned: p.is_banned ?? false,
        }))
      );
      setTotal(count ?? 0);
      setLoading(false);
    };

    fetchMembers();
  }, [search, refreshKey]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const avatarColors = [
    "bg-rose-200", "bg-amber-200", "bg-sky-200", "bg-emerald-200",
    "bg-violet-200", "bg-pink-200", "bg-teal-200", "bg-orange-200",
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-foreground">Recent Members</h3>
        <div className="relative w-full sm:w-56">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border text-left text-xs font-semibold uppercase text-muted-foreground">
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  Loading members...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((m, i) => (
                <tr
                  key={m.id}
                  className={`border-t border-border ${m.isAdmin ? "bg-primary/5" : ""}`}
                >
                  <td className="flex items-center gap-3 px-5 py-3">
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarColors[i % avatarColors.length]} text-sm font-bold`}
                      >
                        {(m.full_name ?? m.email ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {m.full_name || m.email || "Unknown"}
                      </span>
                      {m.isAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                          <Shield size={10} />
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {m.isAdmin ? "Administration" : "Member"}
                  </td>
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
        <p className="text-xs text-muted-foreground">
          Showing {members.length} of {total} members
        </p>
        <button
          onClick={() => navigate("/admin/members")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all members
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default RecentMembers;
