import { Star } from "lucide-react";

type StarRatingProps = {
  value: number | null | undefined;
  onChange?: (value: number | undefined) => void;
  size?: "sm" | "lg";
};

export function StarRating({ value, onChange, size = "lg" }: StarRatingProps) {
  const dim = size === "sm" ? "w-4 h-4" : "w-7 h-7";
  const gap = size === "sm" ? "gap-0.5" : "gap-1.5";

  return (
    <div className={`flex items-center ${gap}`}>
      {[1, 2, 3, 4, 5].map((v) => {
        const filled = value != null && v <= value;
        const icon = (
          <Star
            className={dim}
            style={
              filled
                ? { fill: "#FBBF24", color: "#FBBF24" }
                : { fill: "transparent", color: "hsl(var(--muted-foreground))" }
            }
          />
        );
        if (!onChange) {
          return <span key={v}>{icon}</span>;
        }
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(value === v ? undefined : v)}
            className="transition-all duration-150 active:scale-90"
            aria-label={`${v}スター`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
