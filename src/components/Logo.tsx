type LogoProps = {
  size?: number;
  showWord?: boolean;
  className?: string;
};

export function SproutMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 34 C20 26 20 22 20 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 22 C14 20 10 14 10 10 C16 11 20 16 20 22 Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M20 18 C26 16 30 12 31 8 C24 9 20 13 20 18 Z"
        fill="currentColor"
      />
      <ellipse
        cx="20"
        cy="35"
        rx="6"
        ry="1.2"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  );
}

export function Logo({ size = 28, showWord = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span className="text-sprout">
        <SproutMark size={size} />
      </span>
      {showWord && (
        <span
          className="font-serif font-bold tracking-wide"
          style={{ fontSize: size * 0.85, letterSpacing: "0.06em" }}
        >
          Tane
        </span>
      )}
    </span>
  );
}
