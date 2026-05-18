"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { parseISO, startOfWeek, format, addDays } from "date-fns";
import type { DailyCount } from "@/server/queries/log";

type Props = {
  dailyData: DailyCount[];
  color: string | null;
};

type ChartItem = { label: string; count: number };

function aggregateWeekly(dailyData: DailyCount[]): ChartItem[] {
  const weekMap = new Map<string, number>();
  for (const { date, count } of dailyData) {
    const d = parseISO(date);
    const monday = startOfWeek(addDays(d, 1), { weekStartsOn: 1 }); // JST week starts Mon
    const key = format(monday, "yyyy-MM-dd");
    weekMap.set(key, (weekMap.get(key) ?? 0) + count);
  }
  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ label: format(parseISO(week), "M/d"), count }));
}

export function LogGraph({ dailyData, color }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const barColor = color ?? "#7C4DFF";
  const defaultMode = dailyData.length > 60 ? "weekly" : "daily";
  const [mode, setMode] = useState<"daily" | "weekly">(defaultMode);

  const dailyItems: ChartItem[] = dailyData.map((d) => ({
    label: format(parseISO(d.date), "M/d"),
    count: d.count,
  }));
  const weeklyItems = aggregateWeekly(dailyData);
  const chartData = mode === "daily" ? dailyItems : weeklyItems;

  if (!mounted) return <div style={{ height: 144 }} />;
  if (dailyData.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-6">この期間の記録はありません</p>;
  }

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {(["daily", "weekly"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              mode === m
                ? "bg-primary/20 text-primary border-primary/30"
                : "text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {m === "daily" ? "日別" : "週別"}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#666" }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#999" }}
            itemStyle={{ color: barColor }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(value) => [`${value}件`, ""]}
          />
          <Bar dataKey="count" fill={barColor} fillOpacity={0.75} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
