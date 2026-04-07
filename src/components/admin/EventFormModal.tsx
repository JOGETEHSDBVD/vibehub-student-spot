import { useState, useEffect, KeyboardEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Upload, X, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";


interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  event?: {
    id: string;
    title: string;
    description: string | null;
    date: string;
    end_time?: string | null;
    location: string | null;
    image_url: string | null;
    category: string | null;
    pole: string | null;
    target_annee?: string | null;
    tags?: string[] | null;
  } | null;
}

interface ImageItem {
  file?: File;
  url: string;
}

const categories = ["Sports", "Culture", "Entrepreneurship"];
const poles = [
  "Not specified",
  "Digital & IT",
  "Industrie",
  "Gestion & Commerce",
  "Tourisme & Hôtellerie",
  "Agriculture",
  "Services à la personne",
  "BTP",
  "Agroalimentaire / Industrie Alimentaire",
  "Génie Mécanique",
  "Électricité & Automatisation",
  "Génie Énergétique",
];
const annees = ["Not specified", "1ere_annee", "2eme_annee"];
const anneeLabels: Record<string, string> = {
  "Not specified": "Not specified",
  "1ere_annee": "1ère Année",
  "2eme_annee": "2ème Année",
};

const EventFormModal = ({ open, onClose, onSaved, event }: EventFormModalProps) => {
  const { user } = useAuth();
  const isEditing = !!event;

  const [title, setTitle] = useState(event?.title ?? "");

  // Load qr_enabled for editing
  useEffect(() => {
    if (isEditing && event?.id) {
      const loadQr = async () => {
        const { data } = await supabase
          .from("events")
          .select("qr_enabled")
          .eq("id", event.id)
          .single();
        if (data) setQrEnabled((data as any).qr_enabled ?? false);
      };
      loadQr();
    }
  }, [isEditing, event?.id]);
  const [description, setDescription] = useState(event?.description ?? "");
  const [date, setDate] = useState<Date | undefined>(event?.date ? new Date(event.date) : undefined);
  const [time, setTime] = useState(event?.date ? format(new Date(event.date), "HH:mm") : "12:00");
  const [hasEndTime, setHasEndTime] = useState(!!event?.end_time);
  const [endTime, setEndTime] = useState(event?.end_time ? format(new Date(event.end_time), "HH:mm") : "14:00");
  const [location, setLocation] = useState(event?.location ?? "");
  const [category, setCategory] = useState(event?.category ?? "Sports");
  const [pole, setPole] = useState(event?.pole ?? "Not specified");
  const [targetAnnee, setTargetAnnee] = useState(event?.target_annee ?? "Not specified");
  const [tags, setTags] = useState<string[]>(event?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [qrEnabled, setQrEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  // Multi-image state
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Load existing images for editing
  useEffect(() => {
    if (isEditing && event?.id) {
      const loadMedia = async () => {
        const { data } = await supabase
          .from("event_media")
          .select("url")
          .eq("event_id", event.id)
          .eq("media_type", "image");
        if (data && data.length > 0) {
          setImages(data.map((m) => ({ url: m.url })));
        }
      };
      loadMedia();
    }
    // Also load main image_url
    if (event?.image_url) {
      setImages((prev) => {
        if (prev.some((p) => p.url === event.image_url)) return prev;
        return [{ url: event.image_url! }, ...prev];
      });
    }
  }, [isEditing, event?.id, event?.image_url]);

  const addTag = (value: string) => {
    const tag = value.trim().replace(/^#/, "");
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) {
      toast({ title: "Maximum 5 images allowed", variant: "destructive" });
      return;
    }
    const newImages: ImageItem[] = Array.from(files).slice(0, remaining).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (activeImageIndex === index) setActiveImageIndex(null);
    else if (activeImageIndex !== null && activeImageIndex > index) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const setAsMain = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const newArr = [...prev];
      const [item] = newArr.splice(index, 1);
      newArr.unshift(item);
      return newArr;
    });
    setActiveImageIndex(0);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!date) {
      toast({ title: "Please select a date", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      // Upload new image files
      const uploadedUrls: string[] = [];
      for (const img of images) {
        if (img.file) {
          const ext = img.file.name.split(".").pop();
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("event-images")
            .upload(path, img.file);
          if (uploadErr) {
            toast({ title: "Image upload failed", description: uploadErr.message, variant: "destructive" });
            setSaving(false);
            return;
          }
          const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
          uploadedUrls.push(urlData.publicUrl);
        } else {
          uploadedUrls.push(img.url);
        }
      }

      const mainImageUrl = uploadedUrls[0] ?? null;

      const dateObj = new Date(date);
      const [h, m] = time.split(":").map(Number);
      dateObj.setHours(h, m, 0, 0);

      let endTimeIso: string | null = null;
      if (hasEndTime) {
        const endDateObj = new Date(date);
        const [eh, em] = endTime.split(":").map(Number);
        endDateObj.setHours(eh, em, 0, 0);
        endTimeIso = endDateObj.toISOString();
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        date: dateObj.toISOString(),
        end_time: endTimeIso,
        location: location.trim() || null,
        category,
        pole: pole === "Not specified" ? null : pole,
        target_annee: targetAnnee === "Not specified" ? null : targetAnnee,
        image_url: mainImageUrl,
        tags,
      };

      let eventId = event?.id;

      if (isEditing) {
        const { error } = await supabase.from("events").update(payload).eq("id", event!.id);
        if (error) {
          toast({ title: "Failed to update event", description: error.message, variant: "destructive" });
          setSaving(false);
          return;
        }
        // Clear old media and re-insert
        await supabase.from("event_media").delete().eq("event_id", event!.id).eq("media_type", "image");
        toast({ title: "Event updated successfully" });
      } else {
        const { data: inserted, error } = await supabase.from("events").insert({
          ...payload,
          is_published: false,
          created_by: user?.id ?? null,
        }).select("id").single();
        if (error) {
          toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
          setSaving(false);
          return;
        }
        eventId = inserted.id;
        toast({ title: "Event created successfully" });
      }

      // Insert additional images into event_media (skip first which is image_url)
      if (eventId && uploadedUrls.length > 1) {
        const mediaRows = uploadedUrls.slice(1).map((url) => ({
          event_id: eventId!,
          url,
          media_type: "image",
        }));
        await supabase.from("event_media").insert(mediaRows);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md max-h-[85vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the event..." />
          </div>

          <div>
            <Label>Date & Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-[130px] pl-8" />
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Checkbox
                id="hasEndTime"
                checked={hasEndTime}
                onCheckedChange={(checked) => setHasEndTime(!!checked)}
              />
              <label htmlFor="hasEndTime" className="text-sm text-muted-foreground cursor-pointer">
                Add finish time
              </label>
            </div>

            {hasEndTime && (
              <div className="mt-2 flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-[130px] pl-8" />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Event location" />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Pôle</Label>
            <Select value={pole} onValueChange={setPole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {poles.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Année</Label>
            <Select value={targetAnnee} onValueChange={setTargetAnnee}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {annees.map((a) => <SelectItem key={a} value={a}>{anneeLabels[a]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Hashtags</Label>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-md border border-input px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
              {tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  #{tag}
                  <button type="button" onClick={() => removeTag(i)} className="hover:text-destructive"><X size={12} /></button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput.trim() && addTag(tagInput)}
                placeholder={tags.length === 0 ? "Type and press space or enter..." : ""}
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Multi-Image Upload */}
          <div>
            <Label>Images (up to 5)</Label>
            <div className="mt-1 space-y-3">
              {/* Thumbnails grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={cn(
                        "relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all",
                        activeImageIndex === i ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setActiveImageIndex(activeImageIndex === i ? null : i)}
                    >
                      <img src={img.url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                        className="absolute top-0.5 right-0.5 rounded-full bg-destructive/80 p-0.5 text-destructive-foreground hover:bg-destructive"
                      >
                        <X size={10} />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-primary-foreground text-center py-0.5">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Image preview panel */}
              {activeImageIndex !== null && images[activeImageIndex] && (
                <div className="rounded-md border border-border p-3 space-y-3 bg-muted/30">
                  <p className="text-xs font-medium text-foreground">
                    Preview — Image {activeImageIndex + 1}
                  </p>
                  <div className="relative w-full aspect-video rounded-md overflow-hidden border border-border bg-muted">
                    <img
                      src={images[activeImageIndex].url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {activeImageIndex !== 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs"
                      onClick={() => setAsMain(activeImageIndex)}
                    >
                      <Star size={12} /> Set as main image
                    </Button>
                  )}
                </div>
              )}

              {images.length < 5 && (
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                  <Upload size={16} />
                  {images.length === 0 ? "Choose images..." : `Add more (${5 - images.length} remaining)`}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormModal;
