import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./bridge/api";
import { log } from "./shared/log";
import { initStore } from "./shared/store";
import "./ui/styles.css";

const view = new URLSearchParams(location.search).get("view") ?? "harness";
document.documentElement.dataset.view = view;

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: Error, info: ErrorInfo) {
    void log("error", `${view} crashed: ${error.message}\n${info.componentStack ?? ""}`);
    // An overlay that crashed must never keep the desktop blocked: ask the
    // native side to release input and rebuild this window.
    if (view === "overlay") void api.reportFailure(error.message).catch(() => undefined);
  }
  override render() {
    if (!this.state.failed) return this.props.children;
    if (view === "settings") return <div style={{ padding: 24, font: "14px Segoe UI" }}>Something went wrong. Please close this window and open Settings again.</div>;
    return null;
  }
}

window.addEventListener("error", (e) => void log("error", `${view}: ${e.message}`));
window.addEventListener("unhandledrejection", (e) => void log("warn", `${view}: unhandled ${String(e.reason)}`));

async function start() {
  const root = createRoot(document.getElementById("root")!);
  if (view === "harness") {
    const { Harness } = await import("./harness/Harness");
    root.render(<Harness />);
    return;
  }
  try {
    await initStore();
  } catch (e) {
    void log("error", `${view} could not start: ${String(e)}`);
    return; // overlays stay click-through and invisible; nothing is blocked
  }
  if (view === "overlay") {
    const { OverlayApp } = await import("./overlay/OverlayApp");
    root.render(
      <Boundary>
        <OverlayApp />
      </Boundary>,
    );
  } else if (view === "settings") {
    document.body.style.background = "var(--page)";
    const { SettingsApp } = await import("./settings/SettingsApp");
    root.render(
      <Boundary>
        <SettingsApp />
      </Boundary>,
    );
  } else {
    const { ToolbarApp } = await import("./toolbar/ToolbarApp");
    root.render(
      <Boundary>
        <ToolbarApp />
      </Boundary>,
    );
  }
}

void start();
