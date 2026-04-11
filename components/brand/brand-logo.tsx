import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: {
    gap: "gap-2.5",
    mark: "size-8",
    wordmark: "text-lg",
  },
  md: {
    gap: "gap-3",
    mark: "size-10",
    wordmark: "text-xl",
  },
  lg: {
    gap: "gap-3.5",
    mark: "size-12",
    wordmark: "text-2xl",
  },
} as const;

export function BrandMark({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect x="4" y="4" width="56" height="56" rx="18" fill="#101828" />
      <rect
        x="7.5"
        y="7.5"
        width="49"
        height="49"
        rx="14.5"
        stroke="#F2D28E"
        strokeOpacity="0.42"
      />
      <path
        d="M21 18.5V45.5"
        stroke="#F8FAFC"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M21.5 31.75L34.75 18.5"
        stroke="#C69A3A"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M21.5 31.75L35 45.25"
        stroke="#C69A3A"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M45.5 22.75C43.7 20.75 41.4 19.75 38.6 19.75C33.3 19.75 29.5 25 29.5 32C29.5 39 33.3 44.25 38.6 44.25C41.4 44.25 43.7 43.25 45.5 41.25"
        stroke="#F2D28E"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandLogo({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
  size = "md",
}: BrandLogoProps) {
  const styles = sizeMap[size];

  return (
    <span
      className={cn(
        "inline-flex items-center leading-none",
        styles.gap,
        className,
      )}
    >
      <BrandMark className={cn(styles.mark, markClassName)} />
      {showWordmark ? (
        <span
          className={cn(
            "font-semibold tracking-[-0.05em] text-current",
            styles.wordmark,
            wordmarkClassName,
          )}
        >
          KaraCarta
        </span>
      ) : null}
    </span>
  );
}
