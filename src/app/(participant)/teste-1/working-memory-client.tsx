"use client";

import { saveWorkingMemory } from "@/lib/logging";
import type { WorkingMemoryLog } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

const ROWS = 5;
const COLS = 5;
const TEST_MS = 60_000;
/** Ritmo lento: cada quadrado visível e pausa entre passos. */
const HIGHLIGHT_MS = 1_450;
const GAP_MS = 700;
/** Pausa neutra entre ensaios (sem indicar se a resposta foi certa ou errada). */
const BETWEEN_TRIALS_MS = 480;

type Phase = "intro" | "seq" | "ask" | "between" | "done";

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomSequence(len: number): Array<{ r: number; c: number }> {
  const indices: number[] = [];
  while (indices.length < len) {
    const n = randInt(0, ROWS * COLS - 1);
    if (!indices.includes(n)) indices.push(n);
  }
  return indices.map((i) => ({ r: Math.floor(i / COLS), c: i % COLS }));
}

export function WorkingMemoryClient({
  subjectId,
  onDone,
}: {
  subjectId: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [seq, setSeq] = useState<Array<{ r: number; c: number }>>([]);
  const [askPos, setAskPos] = useState(1);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(
    null
  );
  const [tick, setTick] = useState(0);

  const startMsRef = useRef<number | null>(null);
  const trialStartRef = useRef<number>(0);
  const trialsRef = useRef<WorkingMemoryLog["data"]["trials"]>([]);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (phase === "intro" || phase === "done") return;
    const id = window.setInterval(() => setTick((x) => x + 1), 250);
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
    async (finalTrials: WorkingMemoryLog["data"]["trials"]) => {
      const end = Date.now();
      const start = startMsRef.current ?? end;
      const correct = finalTrials.filter((t) => t.correct).length;
      const accuracy =
        finalTrials.length === 0 ? 0 : correct / finalTrials.length;
      const rts = finalTrials.map((t) => t.reactionMs);
      const meanReactionMs =
        rts.length === 0 ? 0 : rts.reduce((a, b) => a + b, 0) / rts.length;
      await saveWorkingMemory(subjectId, {
        trials: finalTrials,
        accuracy,
        meanReactionMs: Math.round(meanReactionMs),
        durationMs: end - start,
      });
      onDone();
    },
    [onDone, subjectId]
  );

  const runNextTrial = useCallback(
    (existing: WorkingMemoryLog["data"]["trials"]) => {
      clearTimers();
      const start = startMsRef.current;
      if (start != null && Date.now() - start >= TEST_MS) {
        setPhase("done");
        void finish(existing);
        return;
      }

      const len = randInt(4, 6);
      const sequence = randomSequence(len);
      const pos = randInt(1, len);
      setSeq(sequence);
      setAskPos(pos);
      setActiveCell(null);
      setPhase("seq");

      let i = 0;
      const step = () => {
        const st = startMsRef.current;
        if (st != null && Date.now() - st >= TEST_MS) {
          setPhase("done");
          void finish(existing);
          return;
        }
        if (i >= sequence.length) {
          setPhase("ask");
          trialStartRef.current = Date.now();
          return;
        }
        setActiveCell(sequence[i]);
        const t1 = window.setTimeout(() => setActiveCell(null), HIGHLIGHT_MS);
        const t2 = window.setTimeout(() => {
          i += 1;
          step();
        }, HIGHLIGHT_MS + GAP_MS);
        timersRef.current.push(t1, t2);
      };
      step();
    },
    [clearTimers, finish]
  );

  const startRun = () => {
    clearTimers();
    trialsRef.current = [];
    startMsRef.current = Date.now();
    setTick(0);
    runNextTrial([]);
  };

  const onCellPress = (r: number, c: number) => {
    if (phase !== "ask") return;
    const answer = { r, c };
    const target = seq[askPos - 1];
    const ok = target.r === r && target.c === c;
    const reactionMs = Math.max(0, Date.now() - trialStartRef.current);
    setPhase("between");
    setActiveCell(null);

    const row: WorkingMemoryLog["data"]["trials"][number] = {
      sequence: seq,
      askedPosition: askPos,
      answer,
      correct: ok,
      reactionMs,
    };
    const next = [...trialsRef.current, row];
    trialsRef.current = next;

    const t = window.setTimeout(() => {
      const st = startMsRef.current;
      if (st != null && Date.now() - st >= TEST_MS) {
        setPhase("done");
        void finish(next);
      } else {
        runNextTrial(next);
      }
    }, BETWEEN_TRIALS_MS);
    timersRef.current.push(t);
  };

  if (phase === "intro") {
    return (
      <div className="naplin-card mx-auto max-w-lg p-6">
        <h2 className="text-lg font-bold text-ink-900 dark:text-white">
          Memória de trabalho
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-night-300">
          Memorize a ordem em que os quadrados se acendem, ao ritmo mostrado, na
          grelha 5×5. A sequência tem entre 4 e 6 quadrados. Depois toque no
          quadrado que corresponde à posição pedida (por exemplo o 4.º da
          sequência). Não receberá indicação de acerto ou erro até ao fim. O
          teste dura cerca de 1 minuto.
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

  // tick referenced to refresh countdown display
  void tick;

  return (
    <div className="mx-auto max-w-lg space-y-4">
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

      {phase === "ask" ? (
        <div className="naplin-card p-4 text-center">
          <p className="text-sm text-ink-600 dark:text-night-300">Toque no</p>
          <p className="mt-1 font-mono text-4xl font-bold text-brand-600 dark:text-brand-300">
            {askPos}.º
          </p>
          <p className="mt-2 text-xs text-ink-500 dark:text-night-400">
            quadrado da sequência
          </p>
        </div>
      ) : null}

      {phase === "seq" ? (
        <p className="text-center text-sm text-ink-600 dark:text-night-300">
          Memorize a sequência…
        </p>
      ) : null}

      <div
        className="mx-auto grid max-w-[min(100vw-2rem,380px)] grid-cols-5 gap-2"
        style={{ aspectRatio: "1" }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const lit = activeCell?.r === r && activeCell?.c === c;
          const canTap = phase === "ask";
          return (
            <button
              key={i}
              type="button"
              disabled={!canTap}
              onClick={() => onCellPress(r, c)}
              className={`rounded-2xl border transition ${
                lit
                  ? "border-brand-500 bg-brand-500 shadow-inner dark:border-brand-400 dark:bg-brand-500"
                  : "border-ink-200 bg-white dark:border-white/10 dark:bg-night-900"
              } ${canTap ? "active:scale-[0.97]" : "opacity-90"}`}
              aria-label={`Célula linha ${r + 1} coluna ${c + 1}`}
            />
          );
        })}
      </div>
      <p className="text-center text-xs text-ink-500 dark:text-night-400">
        Toque com precisão — a grelha é sensível ao toque.
      </p>
    </div>
  );
}
