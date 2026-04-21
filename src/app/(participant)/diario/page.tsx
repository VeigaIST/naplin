"use client";

import { PageHeader } from "@/components/page-header";
import { Likert9 } from "@/components/likert-9";
import { RequireParticipant } from "@/components/require-participant";
import { useParticipant } from "@/components/participant-provider";
import { saveSleepDiary } from "@/lib/logging";
import type { SleepDiaryLog } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type WokeBy = SleepDiaryLog["data"]["wokeBy"];

export default function DiarioPage() {
  return (
    <RequireParticipant>
      <DiarioInner />
    </RequireParticipant>
  );
}

function DiarioInner() {
  const { participant: current } = useParticipant();
  const router = useRouter();
  const [lightsOff, setLightsOff] = useState("");
  const [minutesToSleep, setMinutesToSleep] = useState("");
  const [wokeAt, setWokeAt] = useState("");
  const [wokeBy, setWokeBy] = useState<WokeBy | null>(null);
  const [gotOutOfBedAt, setGotOutOfBedAt] = useState("");
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [enoughSleep, setEnoughSleep] = useState<number | null>(null);
  const [restedRefreshed, setRestedRefreshed] = useState<number | null>(null);
  const [easyToGetUp, setEasyToGetUp] = useState<number | null>(null);
  const [sleepiness, setSleepiness] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const valid = useMemo(() => {
    if (!current) return false;
    const minsTrim = minutesToSleep.trim();
    const mins = Number(minsTrim);
    return (
      timeOk(lightsOff) &&
      minsTrim !== "" &&
      Number.isFinite(mins) &&
      mins >= 0 &&
      timeOk(wokeAt) &&
      wokeBy != null &&
      timeOk(gotOutOfBedAt) &&
      sleepQuality != null &&
      enoughSleep != null &&
      restedRefreshed != null &&
      easyToGetUp != null &&
      sleepiness != null
    );
  }, [
    current,
    lightsOff,
    minutesToSleep,
    wokeAt,
    wokeBy,
    gotOutOfBedAt,
    sleepQuality,
    enoughSleep,
    restedRefreshed,
    easyToGetUp,
    sleepiness,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!current || !valid) return;
    setSaving(true);
    try {
      await saveSleepDiary(current.id, {
        lightsOff,
        minutesToSleep: Number(minutesToSleep),
        wokeAt,
        wokeBy: wokeBy!,
        gotOutOfBedAt,
        sleepQuality: sleepQuality!,
        enoughSleep: enoughSleep!,
        restedRefreshed: restedRefreshed!,
        easyToGetUp: easyToGetUp!,
        sleepiness: sleepiness!,
      });
      router.push("/?saved=diario");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-[calc(10rem+var(--app-safe-bottom))]">
      <PageHeader
        title="Diário de sono"
        subtitle="Responda com base na última noite de sono."
        backHref="/"
      />
      <form
        id="naplin-diario"
        onSubmit={onSubmit}
        className="mx-auto max-w-lg space-y-6 px-4 pt-4"
      >
        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            1. A que horas desligou as luzes?
          </h2>
          <p className="mt-1 text-xs text-ink-500 dark:text-night-400">Formato HH:MM (24 h)</p>
          <input
            type="time"
            className="naplin-input mt-3"
            value={lightsOff}
            onChange={(e) => setLightsOff(e.target.value)}
            required
          />
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            2. Quanto tempo demorou a adormecer?
          </h2>
          <p className="mt-1 text-xs text-ink-500 dark:text-night-400">Minutos</p>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="naplin-input mt-3"
            value={minutesToSleep}
            onChange={(e) => setMinutesToSleep(e.target.value)}
            required
          />
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            3. A que horas acordou?
          </h2>
          <input
            type="time"
            className="naplin-input mt-3"
            value={wokeAt}
            onChange={(e) => setWokeAt(e.target.value)}
            required
          />
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            4. Hoje acordei:
          </h2>
          <div className="mt-4 space-y-2">
            <WokeOption
              label="Sozinho(a)"
              selected={wokeBy === "alone"}
              onSelect={() => setWokeBy("alone")}
            />
            <WokeOption
              label="Despertador (à primeira)"
              selected={wokeBy === "alarm_first"}
              onSelect={() => setWokeBy("alarm_first")}
            />
            <WokeOption
              label="Despertador (vários toques / snooze)"
              selected={wokeBy === "alarm_snooze"}
              onSelect={() => setWokeBy("alarm_snooze")}
            />
            <WokeOption
              label="Outra pessoa despertou-me"
              selected={wokeBy === "other_person"}
              onSelect={() => setWokeBy("other_person")}
            />
            <WokeOption
              label="Algo inesperado (ruído, etc.)"
              selected={wokeBy === "unexpected"}
              onSelect={() => setWokeBy("unexpected")}
            />
          </div>
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            5. A que horas se levantou da cama?
          </h2>
          <input
            type="time"
            className="naplin-input mt-3"
            value={gotOutOfBedAt}
            onChange={(e) => setGotOutOfBedAt(e.target.value)}
            required
          />
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            6. Como classifica a qualidade do seu sono?
          </h2>
          <div className="mt-4">
            <Likert9
              idPrefix="sq"
              value={sleepQuality}
              onChange={setSleepQuality}
              lowLabel="Nada boa"
              highLabel="Muito boa"
            />
          </div>
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            7. Dormiu tempo suficiente?
          </h2>
          <div className="mt-4">
            <Likert9
              idPrefix="enough"
              value={enoughSleep}
              onChange={setEnoughSleep}
              lowLabel="Definitivamente insuficiente"
              highLabel="Definitivamente suficiente"
            />
          </div>
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            8. Sente-se descansado(a) / revigorado(a)?
          </h2>
          <div className="mt-4">
            <Likert9
              idPrefix="rest"
              value={restedRefreshed}
              onChange={setRestedRefreshed}
              lowLabel="De modo algum"
              highLabel="Completamente descansado(a)"
            />
          </div>
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            9. Quão fácil foi levantar-se da cama?
          </h2>
          <div className="mt-4">
            <Likert9
              idPrefix="getup"
              value={easyToGetUp}
              onChange={setEasyToGetUp}
              lowLabel="Muito fácil"
              highLabel="Muito difícil"
            />
          </div>
        </section>

        <section className="naplin-card p-5">
          <h2 className="text-sm font-bold text-ink-900 dark:text-white">
            10. Quão sonolento(a) está neste momento?
          </h2>
          <div className="mt-4">
            <Likert9
              idPrefix="sleepy"
              value={sleepiness}
              onChange={setSleepiness}
              lowLabel="Extremamente alerta"
              highLabel="Extremamente sonolento(a)"
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
            form="naplin-diario"
            className="naplin-btn-primary flex w-full items-center justify-center gap-2"
            disabled={!valid || saving}
          >
            <span aria-hidden>✓</span> Guardar diário
          </button>
        </div>
      </div>
    </div>
  );
}

function timeOk(v: string) {
  return /^\d{2}:\d{2}$/.test(v);
}

function WokeOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
        selected
          ? "border-brand-600 bg-brand-50 text-ink-900 dark:border-brand-500 dark:bg-brand-500/15 dark:text-white"
          : "border-ink-200 bg-white text-ink-800 dark:border-white/10 dark:bg-night-900 dark:text-night-100"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-brand-600 bg-brand-600 dark:border-brand-400 dark:bg-brand-500"
            : "border-ink-300 dark:border-ink-500"
        }`}
        aria-hidden
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
      {label}
    </button>
  );
}
