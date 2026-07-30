"use client";

import { useEffect } from "react";

/** Sikeres beküldés után törli a mentett vázlatot. */
export function ClearSubmitDraft() {
  useEffect(() => {
    try {
      localStorage.removeItem("submit-draft");
    } catch {
      /* noop */
    }
  }, []);
  return null;
}
