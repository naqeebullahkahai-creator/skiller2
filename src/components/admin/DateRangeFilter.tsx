import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { subDays, subMonths, startOfDay, endOfDay, format } from "date-fns";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  { label: "All Time", value: () => ({ from: undefined, to: undefined }) },
  { label: "Last 7 Days", value: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 Days", value: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "Last 3 Months", value: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
];

const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);

  const label = value.from && value.to
    ? `${format(value.from, "MMM dd")} - ${format(value.to, "MMM dd")}`
    : "All Time";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end">
        <div className="flex flex-wrap gap-2 mb-3">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                onChange(preset.value());
                if (preset.label === "All Time") setOpen(false);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <CalendarComponent
          mode="range"
          selected={value.from && value.to ? { from: value.from, to: value.to } : undefined}
          onSelect={(range) => {
            onChange({ from: range?.from, to: range?.to });
            if (range?.from && range?.to) setOpen(false);
          }}
          numberOfMonths={1}
          disabled={(date) => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
