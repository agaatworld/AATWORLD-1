import type { EventMap } from "./types";
import { fakeBackend } from "./fake";

/**
 * Transport: real Tauri IPC inside the app, an in-browser simulation of the
 * Rust side otherwise (development preview and automated UI tests).
 */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown> | Uint8Array): Promise<T> {
  if (isTauri()) {
    const core = await import("@tauri-apps/api/core");
    return core.invoke<T>(cmd, args as Record<string, unknown>);
  }
  return fakeBackend().invoke<T>(cmd, args);
}

export type Unlisten = () => void;

export async function listen<K extends keyof EventMap>(event: K, cb: (payload: EventMap[K]) => void): Promise<Unlisten> {
  if (isTauri()) {
    const ev = await import("@tauri-apps/api/event");
    return ev.listen<EventMap[K]>(event, (e) => cb(e.payload));
  }
  return fakeBackend().listen(event, cb as (p: unknown) => void);
}

/** Subscribe to several events; returns one cleanup (safe to call before resolution). */
export function listenAll(subs: { [K in keyof EventMap]?: (p: EventMap[K]) => void }): Unlisten {
  const pending: Promise<Unlisten>[] = [];
  for (const [k, cb] of Object.entries(subs)) {
    pending.push(listen(k as keyof EventMap, cb as (p: unknown) => void));
  }
  let disposed = false;
  const fns: Unlisten[] = [];
  pending.forEach((p) =>
    p.then((u) => {
      if (disposed) u();
      else fns.push(u);
    }).catch(() => undefined),
  );
  return () => {
    disposed = true;
    fns.splice(0).forEach((f) => f());
  };
}
