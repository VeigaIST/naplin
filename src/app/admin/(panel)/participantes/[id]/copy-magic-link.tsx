"use client";

import { useCallback, useState } from "react";

export function CopyMagicLinkButton({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setState("copied");
      window.setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      window.setTimeout(() => setState("idle"), 2500);
    }
  }, [url]);

  const label =
    state === "copied"
      ? "Copiado"
      : state === "error"
        ? "Não foi possível copiar"
        : "Copiar link";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copiar ligação para a área de transferência"
      className="naplin-btn-secondary inline-flex shrink-0 items-center justify-center px-4 py-2.5 text-sm"
    >
      {label}
    </button>
  );
}
