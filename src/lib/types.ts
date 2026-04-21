export type ThemePreference = "light" | "dark" | "system";

export type Subject = {
  id: string;
  code: string; // human-friendly participant code
  createdAt: number;
  themePreference: ThemePreference;
};

export type LogKind =
  | "sleep_diary"
  | "mood"
  | "test_working_memory"
  | "test_go_nogo"
  | "coffee"
  | "exercise"
  | "meal"
  | "nap";

export type BaseLog = {
  id: string;
  subjectId: string;
  kind: LogKind;
  /** ISO string of when the event occurred (may be user-chosen). */
  at: string;
  /** ISO string of when the row was created. */
  createdAt: string;
  notes?: string;
};

export type SleepDiaryLog = BaseLog & {
  kind: "sleep_diary";
  data: {
    lightsOff: string; // HH:mm
    minutesToSleep: number;
    wokeAt: string; // HH:mm
    wokeBy:
      | "alone"
      | "alarm_first"
      | "alarm_snooze"
      | "other_person"
      | "unexpected";
    gotOutOfBedAt: string; // HH:mm
    sleepQuality: number; // 1-9
    enoughSleep: number; // 1-9
    restedRefreshed: number; // 1-9
    easyToGetUp: number; // 1-9
    sleepiness: number; // 1-9
  };
};

export type MoodLog = BaseLog & {
  kind: "mood";
  data: {
    enthusiastic: number; // 1-9
    tired: number; // 1-9
    upset: number; // 1-9
    content: number; // 1-9
  };
};

export type WorkingMemoryLog = BaseLog & {
  kind: "test_working_memory";
  data: {
    trials: Array<{
      sequence: Array<{ r: number; c: number }>; // highlighted squares order
      askedPosition: number; // 1-indexed position within sequence
      answer: { r: number; c: number } | null;
      correct: boolean;
      reactionMs: number;
    }>;
    accuracy: number; // 0-1
    meanReactionMs: number;
    durationMs: number;
  };
};

export type GoNoGoLog = BaseLog & {
  kind: "test_go_nogo";
  data: {
    trials: Array<{
      stimulus: "p" | "b";
      pressed: boolean;
      reactionMs: number | null;
    }>;
    hits: number;
    misses: number;
    falseAlarms: number;
    correctRejections: number;
    meanReactionMs: number;
    durationMs: number;
  };
};

export type QuickEventLog = BaseLog & {
  kind: "coffee" | "exercise" | "meal" | "nap";
};

export type AnyLog =
  | SleepDiaryLog
  | MoodLog
  | WorkingMemoryLog
  | GoNoGoLog
  | QuickEventLog;
