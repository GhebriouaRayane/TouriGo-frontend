"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4 sm:gap-6",
        month: "w-full space-y-5",
        caption: "relative flex items-center justify-center px-16 pt-1",
        caption_label: "text-center text-sm font-semibold capitalize sm:text-base",
        nav: "absolute inset-x-0 top-1 flex items-center justify-between px-2 sm:px-3",
        nav_button: cn(
          "inline-flex items-center justify-center rounded-full bg-[#5481A0] text-white shadow-[0_10px_20px_rgba(58,96,128,0.24)] transition-all hover:scale-105 hover:bg-[#3A6080] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 h-7 w-7 sm:h-8 sm:w-8 p-0 opacity-90",
        ),
        nav_button_previous: "static",
        nav_button_next: "static",
        table:
          "w-full table-fixed border-separate [border-spacing:0.2rem_0.2rem] sm:[border-spacing:0.4rem_0.4rem]",
        head_row: "",
        head_cell:
          "h-7 p-0 text-center align-middle text-xs font-medium text-[#3A6080]/80 sm:h-9 sm:text-sm dark:text-primary/80",
        row: "",
        cell: cn(
          "relative h-8 p-0 text-center align-middle text-sm focus-within:relative focus-within:z-20 sm:h-11 sm:text-base [&:has([aria-selected])]:bg-[#EEF5FA] [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          "mx-auto flex h-8 w-8 items-center justify-center rounded-md border border-transparent p-0 font-normal text-[#335975] transition-all aria-selected:opacity-100 hover:bg-[#EEF5FA] hover:text-[#3A6080] focus-visible:bg-[#EEF5FA] focus-visible:text-[#3A6080] sm:h-10 sm:w-10",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-[#5481A0] aria-selected:text-white",
        day_range_end:
          "day-range-end aria-selected:bg-[#5481A0] aria-selected:text-white",
        day_selected:
          "bg-[#5481A0] text-white shadow-[0_14px_28px_rgba(58,96,128,0.24)] hover:bg-[#3A6080] focus:bg-[#3A6080]",
        day_today: "border border-[#7C99B0] bg-[#EEF5FA] text-[#3A6080] font-semibold",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50 hover:bg-transparent hover:text-muted-foreground",
        day_range_middle:
          "aria-selected:bg-[#DDEAF2] aria-selected:text-[#335975]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
