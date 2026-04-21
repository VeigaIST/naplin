"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="font-medium text-ink-600 hover:text-ink-900 dark:text-night-300 dark:hover:text-white"
      onClick={async () => {
        await fetch("/api/auth/admin/logout", {
          method: "POST",
          credentials: "include",
        });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Sair
    </button>
  );
}
