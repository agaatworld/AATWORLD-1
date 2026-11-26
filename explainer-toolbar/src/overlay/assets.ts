import { api } from "../bridge/api";
import { log } from "../shared/log";

const MAX_DIM = 4096;

/**
 * Decoded images for one overlay. Decoding is asynchronous (never blocks
 * drawing); very large pictures are downscaled to 4096 px on the long side
 * to bound memory. Unused bitmaps can be released with `prune`.
 */
export class AssetCache {
  private bitmaps = new Map<string, ImageBitmap>();
  private failed = new Set<string>();
  private loading = new Map<string, Promise<ImageBitmap | null>>();

  constructor(private readonly onReady: (name: string) => void) {}

  get(name: string): ImageBitmap | null {
    const b = this.bitmaps.get(name);
    if (b) return b;
    if (!this.failed.has(name)) void this.load(name);
    return null;
  }

  missing(name: string): boolean {
    return this.failed.has(name);
  }

  load(name: string): Promise<ImageBitmap | null> {
    const have = this.bitmaps.get(name);
    if (have) return Promise.resolve(have);
    let p = this.loading.get(name);
    if (p) return p;
    p = (async () => {
      try {
        const buf = await api.readAsset(name);
        let bmp = await createImageBitmap(new Blob([buf]));
        const k = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
        if (k < 1) {
          const small = await createImageBitmap(bmp, { resizeWidth: Math.round(bmp.width * k), resizeHeight: Math.round(bmp.height * k), resizeQuality: "high" });
          bmp.close();
          bmp = small;
        }
        this.bitmaps.set(name, bmp);
        return bmp;
      } catch (e) {
        this.failed.add(name);
        void log("warn", `image ${name} could not be loaded: ${String(e)}`);
        return null;
      } finally {
        this.loading.delete(name);
        this.onReady(name);
      }
    })();
    this.loading.set(name, p);
    return p;
  }

  prune(used: Set<string>): void {
    for (const [name, bmp] of this.bitmaps) {
      if (!used.has(name)) {
        bmp.close();
        this.bitmaps.delete(name);
      }
    }
  }
}
