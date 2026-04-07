import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChangePasswordSection from "@/components/ChangePasswordSection";

const MyAccount = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
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

    const { error: updateErr } = await (supabase.rpc as any)("update_own_profile", {
      _avatar_url: newUrl,
    });

    if (updateErr) {
      toast({ title: "Failed to save avatar", description: updateErr.message, variant: "destructive" });
    } else {
      setAvatarUrl(newUrl);
      refreshProfile();
      toast({ title: "Profile picture updated" });
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header with avatar and name */}
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-border">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
            >
              <Camera size={13} />
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
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.full_name || "Member"}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {uploading && <p className="text-xs text-primary mt-1">Uploading...</p>}
          </div>
        </div>

        {/* Profile Information - Read Only */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-lg font-bold text-foreground">My Information</h2>

          <div>
            <Label className="text-muted-foreground">Full Name</Label>
            <Input value={profile?.full_name ?? ""} disabled className="bg-muted mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Email</Label>
            <Input value={user.email ?? ""} disabled className="bg-muted mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Role at the Établissement</Label>
            <Input
              value={profile?.member_type ? profile.member_type.charAt(0).toUpperCase() + profile.member_type.slice(1) : "—"}
              disabled
              className="bg-muted mt-1"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">Pôle</Label>
            <Input value={profile?.pole ?? "—"} disabled className="bg-muted mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Filière</Label>
            <Input value={profile?.filiere ?? "—"} disabled className="bg-muted mt-1" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyAccount;
