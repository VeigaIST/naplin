export function NaplinLogo({
  size = 28,
  withWordmark = true,
  tone = "dark",
}: {
  size?: number;
  withWordmark?: boolean;
  tone?: "dark" | "light";
}) {
  const wordmarkClass =
    tone === "dark"
      ? "font-bold tracking-tight text-[1.15rem] text-ink-900 dark:text-white"
      : "font-bold tracking-tight text-[1.15rem] text-white";
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
      >
        <rect width="64" height="64" rx="18" className="fill-brand-600 dark:fill-brand-500" />
        <path
          d="M42 20a16 16 0 1 0 0 24 12 12 0 1 1 0-24z"
          fill="#fff"
        />
        <path
          d="M12 50h40"
          stroke="#b8c9ff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && <span className={wordmarkClass}>naplin</span>}
    </div>
  );
}
