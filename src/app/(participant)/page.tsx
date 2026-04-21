"use client";

import Link from "next/link";
import { NaplinLogo } from "@/components/logo";
import { RequireParticipant } from "@/components/require-participant";
import { useParticipant } from "@/components/participant-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { saveQuickEvent } from "@/lib/logging";
import { useEffect, useMemo, useRef, useState } from "react";

type DayPeriod = "manha" | "tarde" | "noite";

function periodFromHour(h: number): DayPeriod {
  if (h >= 6 && h < 12) return "manha";
  if (h >= 12 && h < 18) return "tarde";
  return "noite";
}

function useClockPeriod(): DayPeriod {
  const [p, setP] = useState(() => periodFromHour(new Date().getHours()));
  useEffect(() => {
    const update = () => setP(periodFromHour(new Date().getHours()));
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, []);
  return p;
}

const ROUTINE_TABS: { id: DayPeriod; label: string }[] = [
  { id: "manha", label: "Manhã" },
  { id: "tarde", label: "Tarde" },
  { id: "noite", label: "Noite" },
];

const ROUTINE_BY_PERIOD: Record<
  DayPeriod,
  { heading: string; steps: string[] }
> = {
  manha: {
    heading: "Manhã (6h–12h)",
    steps: [
      "Diário de sono",
      "Teste de memória",
      "Go / No-go",
      "Avaliação de humor",
    ],
  },
  tarde: {
    heading: "Tarde (12h–18h)",
    steps: ["Teste de memória", "Go / No-go", "Avaliação de humor"],
  },
  noite: {
    heading: "Noite (18h–6h)",
    steps: ["Teste de memória", "Go / No-go", "Avaliação de humor"],
  },
};

function SuggestedRoutineSection() {
  const autoPeriod = useClockPeriod();
  const [manualPeriod, setManualPeriod] = useState<DayPeriod | null>(null);
  const active = manualPeriod ?? autoPeriod;

  return (
    <section className="naplin-card mt-2 p-5">
      <h2 className="text-sm font-bold tracking-wide text-ink-900 dark:text-white">
        Rotina sugerida
      </h2>
      <p className="mt-1 text-xs text-ink-500 dark:text-night-400">
        Ajusta-se à hora local. Pode escolher outro período abaixo.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-2xl border border-ink-200/90 bg-white/90 p-1 dark:border-white/10 dark:bg-night-900/80"
          role="tablist"
          aria-label="Período do dia"
        >
          {ROUTINE_TABS.map(({ id, label }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setManualPeriod(id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  selected
                    ? "bg-brand-600 text-white shadow-[0_6px_18px_-4px_rgb(45_74_232_/_0.45)] dark:bg-brand-500"
                    : "text-ink-700 hover:bg-ink-100 dark:text-night-200 dark:hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {manualPeriod !== null ? (
          <button
            type="button"
            onClick={() => setManualPeriod(null)}
            className="self-start text-xs font-semibold text-brand-700 underline-offset-2 hover:underline dark:text-brand-300 sm:self-center"
          >
            Usar hora actual
          </button>
        ) : null}
      </div>
      <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-night-400">
        {ROUTINE_BY_PERIOD[active].heading}
      </h3>
      <p
        className="mt-2 text-sm font-semibold leading-relaxed text-ink-800 dark:text-night-100"
        aria-label={ROUTINE_BY_PERIOD[active].steps.join(", depois ")}
      >
        {ROUTINE_BY_PERIOD[active].steps.join(" → ")}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-night-300">
        Use os botões abaixo para café, refeições, exercício ou sestas —
        registe no{" "}
        <span className="font-semibold text-ink-800 dark:text-white">
          momento
        </span>{" "}
        ou com hora personalizada.
      </p>
    </section>
  );
}

export default function HomePage() {
  return (
    <RequireParticipant>
      <HomeInner />
    </RequireParticipant>
  );
}

function WeekStrip() {
  const days = useMemo(() => {
    const out: {
      key: string;
      label: string;
      dayNum: number;
      isToday: boolean;
    }[] = [];
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 3);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      out.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("pt-PT", { weekday: "short" }),
        dayNum: d.getDate(),
        isToday,
      });
    }
    return out;
  }, []);

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-hidden
    >
      {days.map((d) => (
        <div
          key={d.key}
          className={`flex min-w-[3.25rem] flex-col items-center rounded-2xl px-2 py-2 text-center transition ${
            d.isToday
              ? "bg-coral-500 text-white shadow-glow-coral dark:bg-coral-600"
              : "border border-ink-200/80 bg-white/90 text-ink-700 dark:border-white/10 dark:bg-night-900/75 dark:text-night-200"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">
            {d.label.replace(".", "")}
          </span>
          <span className="text-lg font-bold tabular-nums leading-none">
            {d.dayNum}
          </span>
        </div>
      ))}
    </div>
  );
}

const QUICK_EVENT_TOAST: Record<
  "coffee" | "exercise" | "meal" | "nap",
  string
> = {
  coffee: "Cafeína registada.",
  exercise: "Exercício registado.",
  meal: "Refeição registada.",
  nap: "Sesta registada.",
};

function HomeInner() {
  const { participant: current, signOut } = useParticipant();
  const [busy, setBusy] = useState<string | null>(null);
  const [showAt, setShowAt] = useState<{
    kind: "coffee" | "exercise" | "meal" | "nap";
  } | null>(null);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3200);
  }

  async function quick(
    kind: "coffee" | "exercise" | "meal" | "nap",
    at?: string
  ) {
    if (!current) return;
    const k = `${kind}-${at ?? "now"}`;
    setBusy(k);
    try {
      await saveQuickEvent(current.id, kind, at);
      showToast(QUICK_EVENT_TOAST[kind]);
    } catch {
      showToast("Não foi possível guardar. Tente novamente.");
    } finally {
      setBusy(null);
      setShowAt(null);
    }
  }

  function openEventAtDialog(kind: "coffee" | "exercise" | "meal" | "nap") {
    const { date, time } = localDateTimeParts(new Date());
    setEventDate(date);
    setEventTime(time);
    setShowAt({ kind });
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-4 pb-6 pt-[calc(0.75rem+var(--app-safe-top))]">
      <header className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 shrink">
            <NaplinLogo size={36} />
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <div className="text-right">
              <p className="naplin-pill inline-flex max-w-[14rem] truncate">
                {current ? (
                  <span className="truncate">{current.code}</span>
                ) : null}
              </p>
              <div className="mt-1">
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-700 dark:text-brand-300"
                  onClick={() => void signOut()}
                >
                  Sair da sessão
                </button>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
        <WeekStrip />
      </header>

      <SuggestedRoutineSection />

      <nav className="mt-6 space-y-3" aria-label="Tarefas principais">
        <MainLink
          href="/diario"
          title="Diário de sono"
          description="Horários, hábitos e escalas subjetivas"
        />
        <MainLink
          href="/humor"
          title="Avaliação de humor"
          description="Quatro dimensões rápidas (escala 1–9)"
        />
        <MainLink
          href="/teste-1"
          title="Teste 1 — Memória de trabalho"
          description="Grelha 5×5, ~1 min"
        />
        <MainLink
          href="/teste-2"
          title="Teste 2 — Go / No-go"
          description="Reação a estímulos, ~1 min"
        />
      </nav>

      <section className="mt-8" aria-label="Eventos rápidos">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500 dark:text-night-400">
          Eventos ao longo do dia
        </h2>
        <ul className="mt-3 space-y-3">
          <QuickRow
            label="Café (ou outra cafeína)"
            onNow={() => quick("coffee")}
            onAt={() => openEventAtDialog("coffee")}
            disabled={!!busy}
          />
          <QuickRow
            label="Exercício"
            onNow={() => quick("exercise")}
            onAt={() => openEventAtDialog("exercise")}
            disabled={!!busy}
          />
          <QuickRow
            label="Refeição / snacks"
            onNow={() => quick("meal")}
            onAt={() => openEventAtDialog("meal")}
            disabled={!!busy}
          />
          <QuickRow
            label="Sesta"
            onNow={() => quick("nap")}
            onAt={() => openEventAtDialog("nap")}
            disabled={!!busy}
          />
        </ul>
      </section>

      <p className="mt-8 text-center text-sm text-ink-600 dark:text-night-300">
        <Link href="/registos" className="naplin-link">
          Ver registos
        </Link>
      </p>

      {toast ? (
        <div
          className="fixed bottom-[max(1rem,calc(0.5rem+var(--app-safe-bottom)))] left-1/2 z-[60] max-w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-ink-200/90 bg-white/95 px-4 py-3 text-center text-sm font-semibold text-ink-900 shadow-glow backdrop-blur-sm dark:border-white/10 dark:bg-night-800/95 dark:text-white"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      ) : null}

      {showAt ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAt(null);
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-5 shadow-glow dark:bg-night-900">
            <h3 className="text-base font-bold text-ink-900 dark:text-white" id="event-at-title">
              Dia e hora do evento
            </h3>
            <p className="mt-1 text-xs text-ink-600 dark:text-night-400">
              Escolha o dia e a hora em que ocorreu o registo.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="event-at-date"
                  className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-night-400"
                >
                  Dia
                </label>
                <input
                  id="event-at-date"
                  type="date"
                  className="naplin-input mt-1.5"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  aria-labelledby="event-at-title"
                />
              </div>
              <div>
                <label
                  htmlFor="event-at-time"
                  className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-night-400"
                >
                  Hora
                </label>
                <input
                  id="event-at-time"
                  type="time"
                  step={60}
                  className="naplin-input mt-1.5"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  aria-labelledby="event-at-title"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="naplin-btn-secondary flex-1"
                onClick={() => setShowAt(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="naplin-btn-primary flex-1"
                onClick={() => {
                  const iso = localDateTimeToIso(eventDate, eventTime);
                  if (iso) void quick(showAt.kind, iso);
                }}
                disabled={!eventDate || !eventTime}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MainLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="naplin-main-link">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-ink-900 dark:text-white">{title}</p>
          <p className="mt-1 text-sm text-ink-600 dark:text-night-300">
            {description}
          </p>
        </div>
        <span className="text-xl text-brand-600 dark:text-brand-400" aria-hidden>
          →
        </span>
      </div>
    </Link>
  );
}

function QuickRow({
  label,
  onNow,
  onAt,
  disabled,
}: {
  label: string;
  onNow: () => void;
  onAt: () => void;
  disabled: boolean;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-3xl border border-ink-200/80 bg-white/90 px-3 py-3 dark:border-white/10 dark:bg-night-900/70 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-semibold text-ink-900 dark:text-white">
        {label}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="naplin-btn-secondary flex-1 px-3 py-2 text-sm sm:flex-none"
          onClick={onNow}
          disabled={disabled}
        >
          Agora
        </button>
        <button
          type="button"
          className="naplin-btn-primary flex-none px-3 py-2 text-lg leading-none sm:flex-none"
          onClick={onAt}
          disabled={disabled}
          aria-label="Definir hora"
        >
          📅
        </button>
      </div>
    </li>
  );
}

function localDateTimeParts(d: Date): { date: string; time: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

/** Interpreta `date` + `time` no fuso local e devolve ISO UTC. */
function localDateTimeToIso(date: string, time: string): string | null {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
