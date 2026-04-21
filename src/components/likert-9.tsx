"use client";

export function Likert9({
  value,
  onChange,
  lowLabel,
  highLabel,
  idPrefix,
}: {
  value: number | null;
  onChange: (n: number) => void;
  lowLabel: string;
  highLabel: string;
  idPrefix: string;
}) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
        {nums.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              data-selected={selected}
              className="scale-chip min-h-[44px] min-w-0 touch-manipulation text-sm"
              onClick={() => onChange(n)}
              aria-pressed={selected}
              aria-label={`${n}`}
              id={`${idPrefix}-${n}`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between gap-2 text-[11px] leading-snug text-ink-500 dark:text-night-400">
        <span className="max-w-[42%] text-left">{lowLabel}</span>
        <span className="max-w-[42%] text-right">{highLabel}</span>
      </div>
    </div>
  );
}
