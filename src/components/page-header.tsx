import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function PageHeader({
  title,
  subtitle,
  backHref,
  showThemeToggle = true,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  showThemeToggle?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-white/80 px-4 pb-3 pt-[calc(0.75rem+var(--app-safe-top))] backdrop-blur-xl dark:bg-night-950/85">
      <div className="mx-auto flex max-w-lg items-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="mt-0.5 inline-flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-ink-100/90 text-lg text-ink-800 shadow-sm ring-1 ring-ink-200/80 dark:bg-night-800/90 dark:text-night-100 dark:ring-white/10"
            aria-label="Voltar"
          >
            ←
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-ink-900 dark:text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-ink-600 dark:text-night-300">
              {subtitle}
            </p>
          ) : null}
        </div>
        {showThemeToggle ? (
          <div className="shrink-0 pt-0.5">
            <ThemeToggle />
          </div>
        ) : null}
      </div>
    </header>
  );
}
