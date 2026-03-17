import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Save, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [memberType, setMemberType] = useState("student");
  const [pole, setPole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setMemberType(profile.member_type ?? "student");
      setPole(profile.pole ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("id", user.id);

    if (updateErr) {
      toast({ title: "Failed to save avatar", description: updateErr.message, variant: "destructive" });
    } else {
      setAvatarUrl(newUrl);
      refreshProfile();
      toast({ title: "Profile picture updated" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), member_type: memberType, pole: pole || null })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
    } else {
      refreshProfile();
      toast({ title: "Profile updated successfully" });
    }
    setSaving(false);
  };

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and account settings.</p>
        </div>

        <div className="mx-auto max-w-2xl space-y-8">
          {/* Profile Picture */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-2 border-border">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Upload a new photo</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 5MB.</p>
                {uploading && <p className="text-xs text-primary mt-1">Uploading...</p>}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
              </div>
              <div>
                <Label>Role at the Établissement</Label>
                <Select value={memberType} onValueChange={setMemberType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="administration">Administration Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pôle</Label>
                <Select value={pole} onValueChange={setPole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your pôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Tourisme">Tourisme</SelectItem>
                    <SelectItem value="Arts et Graphique">Arts et Graphique</SelectItem>
                    <SelectItem value="Service à la Personne">Service à la Personne</SelectItem>
                    <SelectItem value="Artisanat">Artisanat</SelectItem>
                    <SelectItem value="Agro-industrie">Agro-industrie</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Gestion et Commerce">Gestion et Commerce</SelectItem>
                    <SelectItem value="Digital et Intelligence Artificielle">Digital et Intelligence Artificielle</SelectItem>
                    <SelectItem value="Industrie">Industrie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
