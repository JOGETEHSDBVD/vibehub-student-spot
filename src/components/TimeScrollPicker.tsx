import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TimeScrollPickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));

const ScrollColumn = ({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx >= 0 && containerRef.current) {
      const el = containerRef.current.children[idx] as HTMLElement;
      el?.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [selected, items]);

  return (
    <div
      ref={containerRef}
      className="h-[200px] overflow-y-auto scroll-smooth snap-y snap-mandatory scrollbar-thin"
      style={{ scrollbarWidth: "thin" }}
    >
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className={cn(
            "w-full py-2 px-4 text-sm font-medium snap-center transition-colors",
            item === selected
              ? "bg-primary text-primary-foreground rounded-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

const TimeScrollPicker = ({ value, onChange }: TimeScrollPickerProps) => {
  const [h, m] = value.split(":");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[130px] justify-start gap-2 text-left font-normal"
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
          {h}:{m}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-2 pointer-events-auto" align="start">
        <div className="flex gap-1">
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-muted-foreground text-center mb-1">HR</p>
            <ScrollColumn
              items={hours}
              selected={h}
              onSelect={(v) => onChange(`${v}:${m}`)}
            />
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-muted-foreground text-center mb-1">MIN</p>
            <ScrollColumn
              items={minutes}
              selected={m}
              onSelect={(v) => onChange(`${h}:${v}`)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimeScrollPicker;
