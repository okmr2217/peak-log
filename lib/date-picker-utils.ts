export type DateMode = "today" | "yesterday" | "other";

export function floorToNearest30(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const floored = minutes < 30 ? 0 : 30;
  return `${String(hours).padStart(2, "0")}:${String(floored).padStart(2, "0")}`;
}

export const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:30`);
}

export const DAY_PICKER_CLASS_NAMES = {
  root: "w-full relative",
  months: "flex flex-col",
  month: "flex flex-col gap-1",
  month_caption: "flex justify-center relative items-center h-9 mb-1",
  caption_label: "text-sm font-semibold text-white",
  nav: "absolute inset-x-0 top-0 flex justify-between items-center h-9 px-1 z-10",
  button_previous: "h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors",
  button_next: "h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "flex-1 text-center text-[11px] text-zinc-500 font-normal pb-2",
  week: "flex",
  day: "flex-1 p-0 flex items-center justify-center",
  day_button: "h-8 w-8 rounded-full text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center",
  selected: "[&>button]:!bg-[#7C4DFF] [&>button]:!text-white [&>button]:shadow-[0_0_12px_rgba(124,77,255,0.5)]",
  today: "[&:not(.rdp-selected)>button]:ring-1 [&:not(.rdp-selected)>button]:ring-[#7C4DFF]/50 [&:not(.rdp-selected)>button]:text-white",
  outside: "opacity-20 pointer-events-none",
  disabled: "opacity-20 pointer-events-none",
  hidden: "invisible",
};
