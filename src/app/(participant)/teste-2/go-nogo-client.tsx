"use client";

import { saveGoNoGo } from "@/lib/logging";
import type { GoNoGoLog } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

const TEST_MS = 60_000;
const TRIAL_MS = 950;
const ISI_MS = 320;

type Phase = "intro" | "run" | "done";

function sleep(ms: number) {
  return new Promise<void>((r) => {
    setTimeout(r, ms);
  });
}

export function GoNoGoClient({
  subjectId,
  onDone,
}: {
  subjectId: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [letter, setLetter] = useState<"p" | "b" | null>(null);
  const [tick, setTick] = useState(0);

  const startMsRef = useRef<number | null>(null);
  const trialsRef = useRef<GoNoGoLog["data"]["trials"]>([]);
  const abortedRef = useRef(false);

  const trialStartRef = useRef<number>(0);
  const respondedRef = useRef(false);
  const reactionMsRef = useRef<number | null>(null);
  const runEpochRef = useRef(0);

  useEffect(() => {
    if (phase !== "run") return;
    const id = window.setInterval(() => setTick((x) => x + 1), 200);
    return () => window.clearInterval(id);
  }, [phase]);

  const timeLeftMs = (() => {
    const s = startMsRef.current;
    if (s == null) return TEST_MS;
    return Math.max(0, TEST_MS - (Date.now() - s));
  })();

  const elapsedPct = (() => {
    const s = startMsRef.current;
    if (s == null) return 0;
    return Math.min(100, ((Date.now() - s) / TEST_MS) * 100);
  })();

  const finish = useCallback(
    async (trials: GoNoGoLog["data"]["trials"]) => {
      const end = Date.now();
      const start = startMsRef.current ?? end;
      let hits = 0;
      let misses = 0;
      let falseAlarms = 0;
      let correctRejections = 0;
      const rts: number[] = [];
      for (const t of trials) {
        if (t.stimulus === "p") {
          if (t.pressed && t.reactionMs != null) {
            hits += 1;
            rts.push(t.reactionMs);
          } else if (!t.pressed) misses += 1;
        } else if (t.stimulus === "b") {
          if (t.pressed) falseAlarms += 1;
          else correctRejections += 1;
        }
      }
      const meanReactionMs =
        rts.length === 0 ? 0 : rts.reduce((a, b) => a + b, 0) / rts.length;
      await saveGoNoGo(subjectId, {
        trials,
        hits,
        misses,
        falseAlarms,
        correctRejections,
        meanReactionMs: Math.round(meanReactionMs),
        durationMs: end - start,
      });
      onDone();
    },
    [onDone, subjectId]
  );

  const runLoop = useCallback(async () => {
    const epoch = ++runEpochRef.current;
    abortedRef.current = false;
    trialsRef.current = [];
    startMsRef.current = Date.now();

    while (!abortedRef.current && runEpochRef.current === epoch) {
      const start = startMsRef.current ?? Date.now();
      if (Date.now() - start >= TEST_MS) break;

      const stim: "p" | "b" = Math.random() < 0.55 ? "p" : "b";
      respondedRef.current = false;
      reactionMsRef.current = null;
      trialStartRef.current = Date.now();
      setLetter(stim);

      await sleep(TRIAL_MS);

      if (abortedRef.current || runEpochRef.current !== epoch) break;

      const pressed = respondedRef.current;
      const rt =
        pressed && reactionMsRef.current != null
          ? Math.max(0, reactionMsRef.current)
          : null;
      trialsRef.current.push({
        stimulus: stim,
        pressed,
        reactionMs: rt,
      });

      setLetter(null);
      await sleep(ISI_MS);
    }

    if (abortedRef.current || runEpochRef.current !== epoch) return;

    setPhase("done");
    await finish(trialsRef.current);
  }, [finish]);

  const startRun = () => {
    setPhase("run");
    void runLoop();
  };

  const onTap = useCallback(() => {
    if (phase !== "run") return;
    if (letter === null) return;
    if (respondedRef.current) return;
    if (Date.now() - trialStartRef.current > TRIAL_MS) return;
    respondedRef.current = true;
    reactionMsRef.current = Date.now() - trialStartRef.current;
  }, [phase, letter]);

  useEffect(() => {
    return () => {
      abortedRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "run") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        onTap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onTap]);

  void tick;

  if (phase === "intro") {
    return (
      <div className="naplin-card mx-auto max-w-lg p-6">
        <h2 className="text-lg font-bold text-ink-900 dark:text-white">
          Go / No-go
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-night-300">
          Toque no botão o mais depressa possível quando aparecer a letra{" "}
          <span className="font-mono font-semibold">p</span>. Não toque quando
          aparecer a letra <span className="font-mono font-semibold">b</span>.
          O teste dura cerca de 1 minuto.
        </p>
        <button
          type="button"
          className="naplin-btn-primary mt-6 w-full"
          onClick={startRun}
        >
          Estou pronto(a) — iniciar
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="naplin-card mx-auto max-w-lg p-6 text-center">
        <p className="text-sm font-semibold text-ink-900 dark:text-white">
          Teste concluído
        </p>
        <p className="mt-2 text-sm text-ink-600 dark:text-night-300">
          Os resultados foram guardados para este participante.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink-500 dark:text-night-400">
          Tempo
        </p>
        <p className="text-xs tabular-nums text-ink-700 dark:text-night-100">
          {Math.ceil(timeLeftMs / 1000)} s
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-200 dark:bg-night-800">
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-300 dark:bg-brand-400"
          style={{ width: `${elapsedPct}%` }}
        />
      </div>

      <div className="naplin-card flex aspect-[4/3] items-center justify-center">
        {letter ? (
          <span className="font-mono text-8xl font-bold text-ink-900 dark:text-white md:text-9xl">
            {letter}
          </span>
        ) : (
          <span className="text-3xl text-ink-300 dark:text-night-600">·</span>
        )}
      </div>

      <button
        type="button"
        className="naplin-btn-primary w-full py-5 text-lg"
        onClick={onTap}
      >
        Toque quando vir P
      </button>
      <p className="text-center text-xs text-ink-500 dark:text-night-400">
        Não toque quando vir b. Pode também usar a barra de espaços.
      </p>
    </div>
  );
}
