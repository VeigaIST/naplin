import Link from "next/link";
import { AdminLogoutButton } from "./admin-logout";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-white/90 backdrop-blur-xl dark:bg-night-950/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 pt-[calc(0.75rem+var(--app-safe-top))]">
          <Link
            href="/admin"
            className="text-sm font-bold text-ink-900 dark:text-white"
          >
            naplin admin
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/admin/participantes"
              className="font-semibold text-brand-700 dark:text-brand-300"
            >
              Participantes
            </Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6 pb-[calc(2rem+var(--app-safe-bottom))]">
        {children}
      </div>
    </div>
  );
}
