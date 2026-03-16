import { useState } from "react";
import { MoreVertical, Shield, ShieldOff, Ban, Undo2, MessageSquare } from "lucide-react";
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isSelf = user?.id === member.id;
  const displayName = member.full_name || member.email || "this member";

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
          <DropdownMenuItem onClick={() => setMessageDialogOpen(true)}>
            <MessageSquare size={14} className="mr-2" />
            Send Message
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!isSelf && (
            <>
              <DropdownMenuItem onClick={() => setAdminDialogOpen(true)}>
                {member.isAdmin ? (
                  <><ShieldOff size={14} className="mr-2" /> Remove Admin</>
                ) : (
                  <><Shield size={14} className="mr-2" /> Make Admin</>
                )}
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
              Cannot modify your own account
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
    </>
  );
};

export default MemberActionsMenu;
