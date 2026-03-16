import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
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
    location: string | null;
    image_url: string | null;
    category: string | null;
  } | null;
}

const categories = ["Sports", "Culture", "Entrepreneurship"];

const EventFormModal = ({ open, onClose, onSaved, event }: EventFormModalProps) => {
  const { user } = useAuth();
  const isEditing = !!event;

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [date, setDate] = useState<Date | undefined>(event?.date ? new Date(event.date) : undefined);
  const [location, setLocation] = useState(event?.location ?? "");
  const [category, setCategory] = useState(event?.category ?? "Sports");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

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
      let image_url = event?.image_url ?? null;

      // Upload image if selected
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("event-images")
          .upload(path, imageFile);
        if (uploadErr) {
          toast({ title: "Image upload failed", description: uploadErr.message, variant: "destructive" });
          setSaving(false);
          return;
        }
        const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        date: date.toISOString(),
        location: location.trim() || null,
        category,
        image_url,
      };

      if (isEditing) {
        const { error } = await supabase.from("events").update(payload).eq("id", event!.id);
        if (error) {
          toast({ title: "Failed to update event", description: error.message, variant: "destructive" });
          setSaving(false);
          return;
        }
        toast({ title: "Event updated successfully" });
      } else {
        const { error } = await supabase.from("events").insert({
          ...payload,
          is_published: false,
          created_by: user?.id ?? null,
        });
        if (error) {
          console.error("Insert event error:", error);
          toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
          setSaving(false);
          return;
        }
        toast({ title: "Event created successfully" });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Event form error:", err);
      toast({ title: "Something went wrong", description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
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
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
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
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Image</Label>
            <div className="mt-1">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                <Upload size={16} />
                {imageFile ? imageFile.name : "Choose image..."}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              </label>
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
