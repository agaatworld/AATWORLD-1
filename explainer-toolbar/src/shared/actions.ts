import { api } from "../bridge/api";
import { isTauri } from "../bridge/ipc";
import type { ToolId } from "../engine/editor";
import { log } from "./log";
import { pushRecent } from "./settings";
import { getApp, patchUi } from "./store";
import type { ActionId } from "./tools";

/** Choosing a tool always means "I want to draw": enter drawing mode too. */
export async function selectTool(tool: ToolId): Promise<void> {
  const app = getApp();
  await patchUi({ tool, recentTools: pushRecent(app.ui.recentTools, tool, 6) });
  if (app.mode.mode !== "annotating") await setDrawing(true);
}

export async function setDrawing(on: boolean): Promise<void> {
  try {
    await api.requestMode(on ? "enterAnnotation" : "exitAnnotation");
  } catch (e) {
    void log("warn", `mode change refused: ${String(e)}`);
  }
}

export async function toggleDrawing(): Promise<void> {
  await setDrawing(getApp().mode.mode !== "annotating");
}

async function pickImageInBrowser(): Promise<void> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png,image/jpeg,image/gif,image/webp,image/bmp";
  const file = await new Promise<File | null>((res) => {
    input.onchange = () => res(input.files?.[0] ?? null);
    input.click();
  });
  if (!file) return;
  const name = await api.importImageBytes(new Uint8Array(await file.arrayBuffer()));
  await api.overlayCommand({ type: "insertImage", asset: name });
  await setDrawing(true);
}

export async function runAction(id: ActionId): Promise<void> {
  try {
    switch (id) {
      case "undo":
        await api.undo();
        break;
      case "redo":
        await api.redo();
        break;
      case "clear":
        await api.clearAll();
        break;
      case "image":
        if (isTauri()) await api.pickImage();
        else await pickImageInBrowser();
        break;
      case "whiteboard":
      case "blackboard":
        await api.overlayCommand({ type: "board", value: id === "whiteboard" ? "toggleWhite" : "toggleBlack" });
        await setDrawing(true);
        break;
      case "hideInk":
        await api.requestMode("toggleInk");
        break;
      case "workspaces":
        break; // opened by the toolbar as a panel
    }
  } catch (e) {
    void log("warn", `action ${id} failed: ${String(e)}`);
  }
}
