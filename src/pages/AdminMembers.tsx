import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, Filter, Download } from "lucide-react";
import MemberActionsMenu from "@/components/admin/MemberActionsMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  isAdmin: boolean;
  isScanner: boolean;
  is_banned: boolean;
  member_type: string | null;
  pole: string | null;
}

const PAGE_SIZE = 10;

const MEMBER_TYPES = [
  { value: "1ere_annee", label: "1ère Année" },
  { value: "2eme_annee", label: "2ème Année" },
  { value: "trainer", label: "Formateur" },
  { value: "administration", label: "Administration" },
];

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
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPole, setFilterPole] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [availablePoles, setAvailablePoles] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  // Fetch distinct poles for the filter
  useEffect(() => {
    if (!isAdmin) return;
    const fetchPoles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("pole")
        .not("pole", "is", null)
        .neq("pole", "");
      const poles = [...new Set((data ?? []).map((p: any) => p.pole).filter(Boolean))] as string[];
      setAvailablePoles(poles.sort());
    };
    fetchPoles();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchMembers = async () => {
      setFetching(true);
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "scanner"] as any[]);
      const adminIds = new Set((adminRoles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
      const scannerIds = new Set((adminRoles ?? []).filter((r) => r.role === "scanner").map((r) => r.user_id));
      const adminIdArray = Array.from(adminIds);

      let query = supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, created_at, is_banned, member_type, pole", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (filterType !== "all") {
        query = query.eq("member_type", filterType);
      }

      if (filterPole !== "all") {
        query = query.eq("pole", filterPole);
      }

      if (filterRole === "admin" && adminIdArray.length > 0) {
        query = query.in("id", adminIdArray);
      } else if (filterRole === "scanner") {
        const scannerIdArray = Array.from(scannerIds);
        if (scannerIdArray.length > 0) query = query.in("id", scannerIdArray);
        else query = query.eq("id", "00000000-0000-0000-0000-000000000000");
      } else if (filterRole === "member" && adminIdArray.length > 0) {
        query = query.not("id", "in", `(${adminIdArray.join(",")})`);
      }

      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, count } = await query;
      setMembers(
        (data ?? []).map((p: any) => ({ ...p, isAdmin: adminIds.has(p.id), isScanner: scannerIds.has(p.id), is_banned: p.is_banned ?? false }))
      );
      setTotal(count ?? 0);
      setFetching(false);
    };
    fetchMembers();
  }, [isAdmin, search, page, refreshKey, filterType, filterPole, filterRole]);

  const refreshMembers = () => setRefreshKey((k) => k + 1);

  const handleExportExcel = async () => {
    const { data: allRoles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "scanner"] as any[]);
    const roleMap = new Map<string, string[]>();
    (allRoles ?? []).forEach((r) => {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role);
      roleMap.set(r.user_id, existing);
    });

    const { data: allMembers } = await supabase
      .from("profiles")
      .select("id, full_name, email, member_type, pole, filiere, is_banned, created_at")
      .order("created_at", { ascending: false });

    if (!allMembers?.length) return;

    const XLSX = await import("xlsx");
    const rows = allMembers.map((m) => {
      const roles = roleMap.get(m.id) || [];
      const role = roles.includes("admin") ? "Admin" : roles.includes("scanner") ? "QR Scanner" : "Member";
      return {
        "Full Name": m.full_name || "—",
        "Email": m.email || "—",
        "Role": role,
        "Type": MEMBER_TYPES.find(t => t.value === m.member_type)?.label || m.member_type || "—",
        "Pôle": m.pole || "—",
        "Filière": m.filiere || "—",
        "Status": m.is_banned ? "Banned" : "Active",
        "Joined": new Date(m.created_at).toLocaleDateString(),
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, `VibeHub_Members_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

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
          <div className="flex flex-col gap-3 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-foreground">All Members ({total})</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleExportExcel}>
                  <Download size={14} /> Export Excel
                </Button>
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
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />

              <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setPage(0); }}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="scanner">QR Scanner</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(0); }}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Member Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {MEMBER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPole} onValueChange={(v) => { setFilterPole(v); setPage(0); }}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Pôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pôles</SelectItem>
                  {availablePoles.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(filterType !== "all" || filterPole !== "all" || filterRole !== "all") && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFilterType("all"); setFilterPole("all"); setFilterRole("all"); setPage(0); }}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-xs font-semibold uppercase text-muted-foreground">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Pôle</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">Loading members...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">No members found.</td></tr>
                ) : (
                  members.map((m, i) => (
                    <tr key={m.id} className={`border-t border-border ${m.isAdmin ? "bg-primary/5" : ""}`}>
                      <td className="flex items-center gap-3 px-5 py-3">
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarColors[i % avatarColors.length]} text-sm font-bold`}>
                            {(m.full_name ?? m.email ?? "?")[0].toUpperCase()}
                          </div>
                        )}
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
                        ) : m.isScanner ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                            QR Scanner
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Member</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium text-foreground">{MEMBER_TYPES.find(t => t.value === m.member_type)?.label || m.member_type || "—"}</span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{m.isAdmin ? "Administration" : "General"}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-muted-foreground">{m.pole || "—"}</span>
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
