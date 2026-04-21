import type {
  GoNoGoLog,
  MoodLog,
  QuickEventLog,
  SleepDiaryLog,
  WorkingMemoryLog,
} from "./types";

export function nowIso(): string {
  return new Date().toISOString();
}

async function postLog(body: unknown): Promise<void> {
  const res = await fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Falha ao guardar o registo.");
  }
}

export async function saveSleepDiary(
  subjectId: string,
  data: SleepDiaryLog["data"],
  at?: string
): Promise<void> {
  const row: SleepDiaryLog = {
    id: "",
    subjectId,
    kind: "sleep_diary",
    at: at ?? nowIso(),
    createdAt: nowIso(),
    data,
  };
  await postLog(row);
}

export async function saveMood(
  subjectId: string,
  data: MoodLog["data"],
  at?: string
): Promise<void> {
  const row: MoodLog = {
    id: "",
    subjectId,
    kind: "mood",
    at: at ?? nowIso(),
    createdAt: nowIso(),
    data,
  };
  await postLog(row);
}

export async function saveWorkingMemory(
  subjectId: string,
  data: WorkingMemoryLog["data"],
  at?: string
): Promise<void> {
  const row: WorkingMemoryLog = {
    id: "",
    subjectId,
    kind: "test_working_memory",
    at: at ?? nowIso(),
    createdAt: nowIso(),
    data,
  };
  await postLog(row);
}

export async function saveGoNoGo(
  subjectId: string,
  data: GoNoGoLog["data"],
  at?: string
): Promise<void> {
  const row: GoNoGoLog = {
    id: "",
    subjectId,
    kind: "test_go_nogo",
    at: at ?? nowIso(),
    createdAt: nowIso(),
    data,
  };
  await postLog(row);
}

export async function saveQuickEvent(
  subjectId: string,
  kind: QuickEventLog["kind"],
  at?: string,
  notes?: string
): Promise<void> {
  const row: QuickEventLog = {
    id: "",
    subjectId,
    kind,
    at: at ?? nowIso(),
    createdAt: nowIso(),
    notes,
  };
  await postLog(row);
}
