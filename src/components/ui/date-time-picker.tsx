"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import "react-day-picker/style.css";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

function toTimeValue(date?: Date) {
  if (!date) return "09:30";
  return format(date, "HH:mm");
}

function mergeDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours || 0, minutes || 0, 0, 0);
  return next;
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const timeValue = toTimeValue(value);

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 flex-1 justify-start rounded-[4px] border-border bg-surface px-3 text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-primary" />
            {value ? format(value, "MMM d, yyyy") : "Pick date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              if (!date) return;
              onChange(mergeDateAndTime(date, timeValue));
              setOpen(false);
            }}
            className="p-3"
            classNames={{
              root: "rdp-root text-foreground",
              months: "flex flex-col",
              month: "space-y-3",
              month_caption: "flex justify-center items-center h-8",
              caption_label: "text-sm font-medium",
              nav: "flex items-center gap-1",
              button_previous:
                "inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary",
              button_next:
                "inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary",
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday: "w-9 text-center text-xs font-medium text-muted-foreground",
              week: "flex w-full mt-1",
              day: "h-9 w-9 p-0 text-center text-sm",
              day_button:
                "h-9 w-9 rounded-md hover:bg-secondary aria-selected:bg-primary aria-selected:text-primary-foreground",
              selected: "bg-primary text-primary-foreground rounded-md",
              today: "text-primary font-semibold",
              outside: "text-muted-foreground opacity-50",
            }}
          />
        </PopoverContent>
      </Popover>

      <div className="relative w-[120px] shrink-0">
        <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="time"
          value={timeValue}
          onChange={(e) => {
            const base = value ?? new Date();
            onChange(mergeDateAndTime(base, e.target.value));
          }}
          className="rounded-[4px] pl-9"
        />
      </div>
    </div>
  );
}
