import { isTauri } from "../bridge/ipc";

type Level = "info" | "warn" | "error";

/** Log to the app's rotating log file (never screen contents or images). */
export async function log(level: Level, message: string): Promise<void> {
  const msg = message.slice(0, 2000);
  if (isTauri()) {
    try {
      const l = await import("@tauri-apps/plugin-log");
      await (level === "error" ? l.error(msg) : level === "warn" ? l.warn(msg) : l.info(msg));
      return;
    } catch {
      /* fall through */
    }
  }
  (level === "error" ? console.error : level === "warn" ? console.warn : console.info)(`[explainer] ${msg}`);
}
