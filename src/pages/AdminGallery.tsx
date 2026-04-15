import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Upload, Save, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";
import {
  loadGalleryConfig,
  saveGalleryConfig,
  type GalleryTile,
  type GalleryConfig,
} from "@/stores/galleryStore";

const AdminGallery = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [config, setConfig] = useState<GalleryConfig | null>(null);
  const [previewHoveredId, setPreviewHoveredId] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user) navigate("/");
      else if (!isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  useEffect(() => {
    setConfig(loadGalleryConfig());
  }, []);

  const updateTile = useCallback((id: number, patch: Partial<GalleryTile>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tiles: prev.tiles.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      };
    });
    setDirty(true);
  }, []);

  const handleImageUpload = (id: number, file: File) => {
    const url = URL.createObjectURL(file);
    updateTile(id, { src: url, alt: file.name });
  };

  const handleDrop = (id: number, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(id, file);
    }
  };

  const handleSave = () => {
    if (config) {
      saveGalleryConfig(config);
      setDirty(false);
      toast.success("Gallery changes saved successfully!");
    }
  };

  if (loading || authLoading || !config) {
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Gallery Manager</h1>
          <p className="text-sm text-muted-foreground">
            Manage the CMC Moments bento grid on the homepage.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 auto-rows-[80px] gap-2">
                {config.tiles.map((tile) => (
                  <div
                    key={tile.id}
                    className={`relative overflow-hidden rounded-xl cursor-pointer group ${tile.className}`}
                    onMouseEnter={() => setPreviewHoveredId(tile.id)}
                    onMouseLeave={() => setPreviewHoveredId(null)}
                    onClick={() => fileInputRefs.current[tile.id]?.click()}
                  >
                    <img
                      src={tile.src}
                      alt={tile.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                    <div className="absolute bottom-1.5 left-2">
                      <span className="text-[10px] font-bold text-primary-foreground drop-shadow-md">
                        {tile.label}
                      </span>
                    </div>
                    {/* Edit overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: previewHoveredId === tile.id ? 1 : 0 }}
                      className="absolute inset-0 bg-foreground/40 flex items-center justify-center"
                    >
                      <div className="bg-background rounded-full p-2 shadow-lg">
                        <Pencil size={14} className="text-primary" />
                      </div>
                    </motion.div>
                  </div>
                ))}
                {/* Live widget mini */}
                <div className="relative overflow-hidden rounded-xl bg-dark-bg flex flex-col items-center justify-center col-span-1 row-span-1">
                  <span className="relative flex h-2 w-2 mb-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Live</span>
                  <span className="text-xs font-black text-dark-bg-foreground">{config.liveBaseNumber}+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slot Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grid Slots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.tiles.map((tile) => (
                  <div
                    key={tile.id}
                    className="flex items-start gap-4 rounded-lg border border-border p-3 transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(tile.id, e)}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <img src={tile.src} alt={tile.alt} className="h-full w-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">Slot {tile.id}</span>
                        <span className="text-[10px] text-muted-foreground/60">{tile.className}</span>
                      </div>
                      <Input
                        value={tile.label}
                        onChange={(e) => updateTile(tile.id, { label: e.target.value })}
                        placeholder="Tile label"
                        className="h-8 text-sm"
                      />
                      <div
                        className="flex items-center gap-2 rounded-md border-2 border-dashed border-border p-2 text-xs text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer"
                        onClick={() => fileInputRefs.current[tile.id]?.click()}
                      >
                        <Upload size={14} />
                        <span>Drop image here or click to upload</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[tile.id] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(tile.id, file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Live Widget Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                  </span>
                  Live Widget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Base Active Number</Label>
                  <Input
                    type="number"
                    value={config.liveBaseNumber}
                    onChange={(e) => {
                      setConfig((prev) => prev ? { ...prev, liveBaseNumber: Number(e.target.value) || 0 } : prev);
                      setDirty(true);
                    }}
                    className="h-9"
                  />
                  <p className="text-xs text-muted-foreground">
                    The number will fluctuate ±4 around this value when auto-fluctuate is on.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-fluctuate</p>
                    <p className="text-xs text-muted-foreground">Randomly vary the count every 3 seconds</p>
                  </div>
                  <Switch
                    checked={config.autoFluctuate}
                    onCheckedChange={(checked) => {
                      setConfig((prev) => prev ? { ...prev, autoFluctuate: checked } : prev);
                      setDirty(true);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Save Button */}
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              onClick={handleSave}
              className="gap-2 shadow-lg px-6 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save size={18} />
              Save Changes
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdminGallery;
