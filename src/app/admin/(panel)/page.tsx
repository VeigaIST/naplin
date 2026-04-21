import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUserId } from "@/lib/auth/server-session";

export default async function AdminHomePage() {
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/admin/login");

  return (
    <>
      <h1 className="text-xl font-bold text-ink-900 dark:text-white">
        Painel de administração
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-600">
        Consulte o histórico de medições de cada participante e exporte os
        dados em formato Excel para análise.
      </p>
      <Link
        href="/admin/participantes"
        className="naplin-btn-primary mt-8 inline-flex items-center justify-center px-5 py-2.5 text-sm"
      >
        Ver participantes
      </Link>
    </>
  );
}
