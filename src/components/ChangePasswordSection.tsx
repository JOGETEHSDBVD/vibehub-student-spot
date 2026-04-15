import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least 1 uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least 1 lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "At least 1 number", test: (p: string) => /[0-9]/.test(p) },
  { label: "At least 1 special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const ChangePasswordSection = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const allPasswordValid = useMemo(() => passwordRules.every((r) => r.test(newPassword)), [newPassword]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPasswordValid) {
      toast({ title: "Password does not meet all requirements", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to update password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Lock size={18} /> Change Password
      </h2>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <Label>New Password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Create a new password" required />
          {newPassword && (
            <div className="mt-2 space-y-1">
              {passwordRules.map((rule, i) => {
                const passed = rule.test(newPassword);
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {passed ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-destructive" />}
                    <span className={passed ? "text-green-600" : "text-muted-foreground"}>{rule.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your new password" required />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive mt-1">Passwords do not match</p>
          )}
        </div>
        <Button type="submit" disabled={saving || !allPasswordValid || newPassword !== confirmPassword} className="gap-2">
          <Lock size={16} />
          {saving ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default ChangePasswordSection;
