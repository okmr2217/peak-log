import Holidays from "date-holidays";

/**
 * 日付の種別。将来のロケール対応でも同じ3種類に集約する。
 * - weekday        : 平日
 * - saturday       : 土曜
 * - sundayOrHoliday: 日曜・祝日
 */
export type DayType = "weekday" | "saturday" | "sundayOrHoliday";

// country コードごとに Holidays インスタンスをキャッシュする（再生成コスト削減）
const checkerCache = new Map<string, Holidays>();

function getChecker(country: string): Holidays {
  if (!checkerCache.has(country)) {
    checkerCache.set(country, new Holidays(country));
  }
  return checkerCache.get(country)!;
}

/**
 * 与えられた日付文字列 (YYYY-MM-DD) の種別を返す。
 * country に ISO 3166-1 alpha-2 コード ("JP", "US", "KR" など) を渡すことで
 * 将来的に他地域の祝日判定へ差し替えられる。
 */
export function getDayType(dateStr: string, country = "JP"): DayType {
  const date = new Date(dateStr);
  const dow = date.getDay(); // 0=日, 6=土

  if (dow === 6) return "saturday";

  const checker = getChecker(country);
  const result = checker.isHoliday(date);
  const isPublicHoliday = result !== false && result.some((h) => h.type === "public");

  if (dow === 0 || isPublicHoliday) return "sundayOrHoliday";

  return "weekday";
}

/**
 * DayType に対応する日付テキスト用 Tailwind クラスを返す。
 * 主役はあくまで emoji なので、色は控えめに設定する。
 */
export function getDateTextClassName(dayType: DayType): string {
  switch (dayType) {
    case "saturday":
      return "text-sky-400/60";
    case "sundayOrHoliday":
      return "text-rose-400/60";
    default:
      return "text-zinc-500";
  }
}
