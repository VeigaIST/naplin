import type { LogKind } from "./types";

export function logKindLabel(kind: LogKind | string): string {
  switch (kind) {
    case "sleep_diary":
      return "Diário de sono";
    case "mood":
      return "Humor";
    case "test_working_memory":
      return "Teste 1 (memória de trabalho)";
    case "test_go_nogo":
      return "Teste 2 (go/no-go)";
    case "coffee":
      return "Cafeína";
    case "exercise":
      return "Exercício";
    case "meal":
      return "Refeição";
    case "nap":
      return "Sesta";
    default:
      return kind;
  }
}
