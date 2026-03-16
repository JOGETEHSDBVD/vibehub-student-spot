import { useState } from "react";
import { MoreVertical, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const members = [
  { name: "Sarah Jenkins", dept: "Entrepreneurship", status: "ACTIVE", joined: "Oct 12, 2023", color: "bg-rose-200" },
  { name: "David Chen", dept: "Sports", status: "ACTIVE", joined: "Oct 10, 2023", color: "bg-amber-200" },
  { name: "Elena Rodriguez", dept: "Culture", status: "PENDING", joined: "Oct 09, 2023", color: "bg-sky-200" },
  { name: "Marcus Thorne", dept: "Sports", status: "ACTIVE", joined: "Oct 05, 2023", color: "bg-emerald-200" },
];

const RecentMembers = () => {
  const [search, setSearch] = useState("");
  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

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
            {filtered.map((m) => (
              <tr key={m.name} className="border-t border-border">
                <td className="flex items-center gap-3 px-5 py-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${m.color} text-sm font-bold`}>
                    {m.name[0]}
                  </div>
                  <span className="font-medium text-foreground">{m.name}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{m.dept}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      m.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{m.joined}</td>
                <td className="px-5 py-3">
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <p className="text-xs text-muted-foreground">Showing {filtered.length} of 1,240 members</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default RecentMembers;
