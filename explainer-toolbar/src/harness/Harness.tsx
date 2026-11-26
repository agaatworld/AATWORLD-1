import { useEffect, useState } from "react";

/**
 * Browser-only preview: a mock desktop with the overlay and toolbar pages in
 * frames, wired together by the simulated backend. Click-through is imitated
 * with `pointer-events`. Used for development and automated screenshots —
 * it proves layout and behaviour of the pages, NOT the Windows integration.
 */
export function Harness() {
  const [tb, setTb] = useState({ x: 0, y: 106, w: 80, h: 520 });
  const [drawing, setDrawing] = useState(false);
  useEffect(() => {
    const ch = new BroadcastChannel("explainer-fake-backend");
    ch.onmessage = (m) => {
      if (m.data.event === "harness://toolbar") setTb(m.data.payload);
      if (m.data.event === "mode://changed") setDrawing(m.data.payload.mode === "annotating");
    };
    try {
      setDrawing(JSON.parse(localStorage.getItem("fake.mode") ?? "{}").mode === "annotating");
    } catch {
      /* ignore */
    }
    return () => ch.close();
  }, []);
  return (
    <div className="harness">
      <MockApp />
      <iframe title="overlay" src="/?view=overlay&monitor=DISPLAY1" style={{ inset: 0, width: "100%", height: "100%", pointerEvents: drawing ? "auto" : "none" }} />
      <iframe title="toolbar" src="/?view=toolbar" style={{ left: tb.x, top: tb.y, width: tb.w, height: tb.h }} />
    </div>
  );
}

/** A plain "application window" to draw over in screenshots. */
function MockApp() {
  const bars = [42, 58, 51, 73, 66, 88];
  return (
    <div style={{ position: "absolute", left: "16%", top: "9%", width: "70%", height: "78%", background: "#fff", borderRadius: 10, boxShadow: "0 20px 60px rgba(0,0,0,.4)", overflow: "hidden", fontFamily: "Segoe UI, sans-serif", color: "#1d2733" }}>
      <div style={{ height: 34, background: "#eef1f5", borderBottom: "1px solid #dde2e8", display: "flex", alignItems: "center", padding: "0 12px", fontSize: 12, color: "#5b6672", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: "#ff5f57" }} />
        <span style={{ width: 10, height: 10, borderRadius: 5, background: "#febc2e" }} />
        <span style={{ width: 10, height: 10, borderRadius: 5, background: "#28c840" }} />
        <span style={{ marginInlineStart: 10 }}>Quarterly review — Presentation</span>
      </div>
      <div style={{ padding: "28px 40px" }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.01em" }}>Revenue by quarter</div>
        <div style={{ fontSize: 15, color: "#5b6672", marginTop: 6 }}>All regions · in millions</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26, height: 260, marginTop: 34, borderBottom: "2px solid #d4dae1", paddingInline: 10 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, height: `${b}%`, background: i === 5 ? "#2e6bff" : "#9db4e8", borderRadius: "6px 6px 0 0" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 26, paddingInline: 10, marginTop: 8, fontSize: 13, color: "#5b6672" }}>
          {["Q1", "Q2", "Q3", "Q4", "Q1", "Q2"].map((q, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              {q}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
