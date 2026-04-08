import { useState } from "react";
import { MoreVertical, Shield, ShieldOff, Ban, Undo2, MessageSquare, Brain } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type Lang,
  scalableTitles,
  resultsText,
  traitDefinitions,
  adviceDb,
  combos,
  conflicts,
  TRAITS_ORDER,
  getLevel,
  getDnaCode,
  getRarity,
} from "@/data/mbtiData";

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  isAdmin: boolean;
  is_banned?: boolean;
}

interface Props {
  member: Member;
  onRefresh: () => void;
}

const MemberActionsMenu = ({ member, onRefresh }: Props) => {
  const { user } = useAuth();
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [mbtiDialogOpen, setMbtiDialogOpen] = useState(false);
  const [mbtiResult, setMbtiResult] = useState<any>(null);
  const [mbtiLoading, setMbtiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isSelf = user?.id === member.id;
  const displayName = member.full_name || member.email || "this member";
  const handleViewMbti = async () => {
    setMbtiLoading(true);
    setMbtiDialogOpen(true);
    const { data, error } = await supabase
      .from("mbti_results")
      .select("*")
      .eq("user_id", member.id)
      .maybeSingle();
    if (error || !data) {
      setMbtiResult(null);
    } else {
      setMbtiResult(data);
    }
    setMbtiLoading(false);
  };

  const mbtiResults = (() => {
    if (!mbtiResult) return null;
    const scores = mbtiResult.scores as Record<string, number>;
    const lang = (mbtiResult.lang || "en") as Lang;
    const levels: Record<string, string> = {};
    const traitResults = TRAITS_ORDER.map((trait) => {
      const lvl = getLevel(scores[trait]);
      levels[trait] = lvl;
      return {
        trait,
        traitLabel: scalableTitles[trait][lang],
        score: scores[trait],
        archetype: resultsText[trait][lvl][lang],
        definition: traitDefinitions[trait][lvl][lang],
      };
    });
    const dnaCode = getDnaCode(scores);
    const rarity = getRarity(scores);
    const conflict = conflicts.find((c) => c.cond(scores));
    const strategyTitles: Record<Lang, string[]> = {
      en: ["Social Strategy", "Team Dynamics", "Execution Style", "Stress Response", "Innovation Approach"],
      fr: ["Stratégie Sociale", "Dynamique d'Équipe", "Style d'Exécution", "Réponse au Stress", "Approche de l'Innovation"],
      ar: ["الاستراتيجية الاجتماعية", "ديناميكية الفريق", "أسلوب التنفيذ", "الاستجابة للضغوط", "منهجية الابتكار"],
    };
    const strategies = TRAITS_ORDER.map((trait, idx) => ({
      title: strategyTitles[lang][idx],
      text: adviceDb[trait]?.[levels[trait]]?.[lang] ?? "",
    }));
    return { traitResults, dnaCode, rarity, conflict, strategies, lang };
  })();

  const handleToggleBan = async () => {
    setLoading(true);
    const newBanned = !member.is_banned;
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: newBanned } as any)
      .eq("id", member.id);

    if (error) {
      toast({ title: "Failed to update member", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newBanned ? `${displayName} has been banned` : `${displayName} has been unbanned` });
      onRefresh();
    }
    setLoading(false);
    setBanDialogOpen(false);
  };

  const handleToggleAdmin = async () => {
    setLoading(true);
    if (member.isAdmin) {
      // Remove admin role
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", member.id)
        .eq("role", "admin");
      if (error) {
        toast({ title: "Failed to remove admin role", description: error.message, variant: "destructive" });
      } else {
        toast({ title: `${displayName} is no longer an admin` });
        onRefresh();
      }
    } else {
      // Add admin role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: member.id, role: "admin" as any });
      if (error) {
        toast({ title: "Failed to assign admin role", description: error.message, variant: "destructive" });
      } else {
        toast({ title: `${displayName} is now an admin` });
        onRefresh();
      }
    }
    setLoading(false);
    setAdminDialogOpen(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({ title: "Please enter a message", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("admin_messages" as any).insert({
      from_user_id: user?.id,
      to_user_id: member.id,
      message: message.trim(),
    } as any);

    if (error) {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Message sent to ${displayName}` });
      setMessage("");
      setMessageDialogOpen(false);
    }
    setLoading(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!isSelf && (
            <>
              <DropdownMenuItem onClick={() => setMessageDialogOpen(true)}>
                <MessageSquare size={14} className="mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAdminDialogOpen(true)}>
                {member.isAdmin ? (
                  <><ShieldOff size={14} className="mr-2" /> Remove Admin</>
                ) : (
                  <><Shield size={14} className="mr-2" /> Make Admin</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewMbti}>
                <Brain size={14} className="mr-2" /> View MBTI Results
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setBanDialogOpen(true)}
                className={member.is_banned ? "text-emerald-600" : "text-destructive focus:text-destructive"}
              >
                {member.is_banned ? (
                  <><Undo2 size={14} className="mr-2" /> Unban Member</>
                ) : (
                  <><Ban size={14} className="mr-2" /> Ban Member</>
                )}
              </DropdownMenuItem>
            </>
          )}
          {isSelf && (
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              This is your account
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {member.is_banned ? "Unban" : "Ban"} {displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {member.is_banned
                ? `This will restore ${displayName}'s access to the platform.`
                : `This will prevent ${displayName} from accessing the platform. You can unban them later.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleBan} disabled={loading}
              className={member.is_banned ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}>
              {loading ? "Processing..." : member.is_banned ? "Unban" : "Ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin Role Confirmation Dialog */}
      <AlertDialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {member.isAdmin ? "Remove admin role from" : "Make"} {displayName} {member.isAdmin ? "" : "an admin"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {member.isAdmin
                ? `${displayName} will lose access to the admin panel and all administrative features.`
                : `${displayName} will gain full access to the admin panel, including managing members, events, and announcements.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleAdmin} disabled={loading}>
              {loading ? "Processing..." : member.isAdmin ? "Remove Admin" : "Make Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to {displayName}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={loading || !message.trim()}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MBTI Results Dialog */}
      <Dialog open={mbtiDialogOpen} onOpenChange={setMbtiDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>MBTI Results — {displayName}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {mbtiLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : !mbtiResult || !mbtiResults ? (
              <div className="text-center py-12">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">No MBTI results found</p>
                <p className="text-xs text-muted-foreground mt-1">This member hasn't taken the test yet.</p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* DNA + Rarity */}
                <div className="rounded-xl border border-border p-4 flex items-center justify-between bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">DNA Code</p>
                    <p className="font-mono font-bold text-lg text-foreground">{mbtiResults.dnaCode}</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: mbtiResults.rarity.color }}>
                    {mbtiResults.rarity.title}
                  </span>
                </div>

                {/* Radar Chart */}
                <div className="rounded-xl border border-border p-4">
                  <svg viewBox="0 0 400 360" className="w-full max-w-sm mx-auto">
                    {(() => {
                      const cx = 200, cy = 170, maxR = 120;
                      const n = mbtiResults.traitResults.length;
                      const angles = mbtiResults.traitResults.map((_: any, i: number) => (Math.PI * 2 * i) / n - Math.PI / 2);
                      const getPoint = (angle: number, r: number) => ({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
                      const rings = [0.25, 0.5, 0.75, 1];
                      const gridLines = rings.map((scale) => angles.map((a: number) => getPoint(a, maxR * scale)).map((p: any) => `${p.x},${p.y}`).join(" "));
                      const dataPoints = mbtiResults.traitResults.map((t: any, i: number) => getPoint(angles[i], (t.score / 100) * maxR));
                      const dataPolygon = dataPoints.map((p: any) => `${p.x},${p.y}`).join(" ");
                      const axisEnds = angles.map((a: number) => getPoint(a, maxR));
                      const labelPoints = angles.map((a: number) => getPoint(a, maxR + 28));
                      return (
                        <>
                          {gridLines.map((pts: string, i: number) => <polygon key={i} points={pts} fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity={0.6} />)}
                          {axisEnds.map((p: any, i: number) => <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="1" opacity={0.4} />)}
                          <polygon points={dataPolygon} fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth="2" />
                          {dataPoints.map((p: any, i: number) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="hsl(var(--primary))" stroke="white" strokeWidth="2" />)}
                          {labelPoints.map((p: any, i: number) => <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" fontSize="11">{mbtiResults.traitResults[i].traitLabel}</text>)}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Conflict */}
                {mbtiResults.conflict && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                    <p className="font-bold text-destructive mb-1">⚔️ {mbtiResults.conflict.name}</p>
                    <p className="text-sm text-foreground/80">{mbtiResults.conflict.text[mbtiResults.lang]}</p>
                  </div>
                )}

                {/* Strategies */}
                <h3 className="font-bold text-foreground">AI Personal Strategy</h3>
                {mbtiResults.strategies.map((s: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-border border-l-4 border-l-primary p-4">
                    <p className="font-bold text-foreground mb-1">📌 {s.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                  </div>
                ))}

                {/* Trait Breakdown */}
                {mbtiResults.traitResults.map((t: any) => (
                  <div key={t.trait} className="rounded-xl border border-border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-foreground">{t.traitLabel}</h3>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{t.archetype}</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-3">"{t.definition}"</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Score</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary transition-all duration-700" style={{ width: `${t.score}%` }} />
                      </div>
                      <span className="text-xs font-medium text-foreground">{t.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemberActionsMenu;
