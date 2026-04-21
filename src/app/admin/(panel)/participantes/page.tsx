import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUserId } from "@/lib/auth/server-session";
import { prisma } from "@/lib/prisma";

export default async function AdminParticipantsPage() {
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/admin/login");

  const list = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      active: true,
      createdAt: true,
      _count: { select: { logs: true } },
    },
  });

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900 dark:text-white">Participantes</h1>
          <p className="mt-2 text-sm text-ink-600">
            Escolha um participante para ver o histórico ou{" "}
            <Link href="/admin/participantes/novo" className="font-medium text-brand-700">
              criar um novo
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/participantes/novo"
          className="naplin-btn-primary inline-flex shrink-0 items-center gap-2 text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 shrink-0 opacity-95"
            aria-hidden
          >
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Novo participante
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="mt-8 text-sm text-ink-600">Ainda não há participantes.</p>
      ) : (
        <ul className="mt-8 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
          {list.map((row) => (
            <li key={row.id}>
              <Link
                href={`/admin/participantes/${row.id}`}
                className="flex flex-col gap-2 px-4 py-4 transition hover:bg-ink-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink-900">{row.code}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
                  <span
                    className={
                      row.active
                        ? "rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800"
                        : "rounded-full bg-ink-100 px-2 py-0.5 text-ink-600"
                    }
                  >
                    {row.active ? "Activo" : "Inactivo"}
                  </span>
                  <span className="tabular-nums">
                    {row._count.logs}{" "}
                    {row._count.logs === 1 ? "registo" : "registos"}
                  </span>
                  <span className="text-ink-400" aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
