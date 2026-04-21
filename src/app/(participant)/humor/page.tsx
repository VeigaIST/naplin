"use client";

import { PageHeader } from "@/components/page-header";
import { Likert9 } from "@/components/likert-9";
import { RequireParticipant } from "@/components/require-participant";
import { useParticipant } from "@/components/participant-provider";
import { saveMood } from "@/lib/logging";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function HumorPage() {
  return (
    <RequireParticipant>
      <HumorInner />
    </RequireParticipant>
  );
}

function HumorInner() {
  const { participant: current } = useParticipant();
  const router = useRouter();
  const [enthusiastic, setEnthusiastic] = useState<number | null>(null);
  const [tired, setTired] = useState<number | null>(null);
  const [upset, setUpset] = useState<number | null>(null);
  const [content, setContent] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const valid = useMemo(() => {
    return (
      current != null &&
      enthusiastic != null &&
      tired != null &&
      upset != null &&
      content != null
    );
  }, [current, enthusiastic, tired, upset, content]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!current || !valid) return;
    setSaving(true);
    try {
      await saveMood(current.id, {
        enthusiastic: enthusiastic!,
        tired: tired!,
        upset: upset!,
        content: content!,
      });
      router.push("/?saved=humor");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-[calc(10rem+var(--app-safe-bottom))]">
      <PageHeader
        title="Avaliação de humor"
        subtitle="Indique o quanto se sente cada estado, de 1 a 9."
        backHref="/"
      />
      <form
        id="naplin-humor"
        onSubmit={onSubmit}
        className="mx-auto max-w-lg space-y-6 px-4 pt-4"
      >
        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            Entusiasmado(a)
          </h2>
          <div className="mt-4">
            <Likert9
              idPrefix="ent"
              value={enthusiastic}
              onChange={setEnthusiastic}
              lowLabel="Nada"
              highLabel="Extremamente"
            />
          </div>
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            Cansado(a)
          </h2>
          <div className="mt-4">
            <Likert9
              idPrefix="tired"
              value={tired}
              onChange={setTired}
              lowLabel="Nada"
              highLabel="Extremamente"
            />
          </div>
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            Chateado(a)
          </h2>
          <div className="mt-4">
            <Likert9
              idPrefix="upset"
              value={upset}
              onChange={setUpset}
              lowLabel="Nada"
              highLabel="Extremamente"
            />
          </div>
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            Contentamento
          </h2>
          <div className="mt-4">
            <Likert9
              idPrefix="content"
              value={content}
              onChange={setContent}
              lowLabel="Nada"
              highLabel="Extremamente"
            />
          </div>
        </section>

        <p className="text-center text-sm text-ink-600 dark:text-night-300">
          <Link href="/registos" className="naplin-link">
            Ver registos
          </Link>
        </p>
      </form>

      <div
        className="fixed left-0 right-0 z-50 border-t border-white/10 bg-white/95 px-4 py-3 backdrop-blur-xl dark:bg-night-950/95 pb-[calc(0.75rem+var(--app-safe-bottom))]"
        style={{ bottom: "var(--naplin-submit-bottom, 0px)" }}
      >
        <div className="mx-auto max-w-lg">
          <button
            type="submit"
            form="naplin-humor"
            className="naplin-btn-primary flex w-full items-center justify-center gap-2"
            disabled={!valid || saving}
          >
            <span aria-hidden>✓</span> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
