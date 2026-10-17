"""Make a small copy of the WordPress 'uploads' photo folder, ready to send.

Run on your own computer (needs Python 3 and Pillow):
    python shrink_uploads.py "C:/path/to/uploads" "C:/path/to/uploads-small" member_photos.txt

The third part is optional but important: member_photos.txt lists ONLY the club member photos.
Without it, every photo in the folder is converted (articles, ads, logos too).

- Keeps the folder structure (2023/03/...).
- Skips WordPress size copies such as "photo-150x150.webp" (only the originals are kept).
- Every photo becomes a .jpg, at most 900 pixels on its longest side.
- Originals are not changed. A file that cannot be read is skipped and reported.
"""
import os
import re
import sys
from PIL import Image, ImageOps

MAX = 600          # members are shown as cards about 240-480 px wide
QUALITY = 80
IMAGES = (".jpg", ".jpeg", ".png", ".webp")
SIZE_COPY = re.compile(r"-\d+x\d+$", re.IGNORECASE)   # e.g. name-150x150

def main():
    if len(sys.argv) not in (3, 4):
        sys.exit('Usage: python shrink_uploads.py "<uploads folder>" "<output folder>" [member_photos.txt]')
    src, dst = sys.argv[1], sys.argv[2]
    only = None
    if len(sys.argv) == 4:
        with open(sys.argv[3], encoding="utf-8") as fh:
            only = {line.strip().replace("\\", "/").lower() for line in fh if line.strip()}
        print(f"only the {len(only)} listed member photos will be converted")
    if not os.path.isdir(src):
        sys.exit(f"ERROR: the folder {src} does not exist. It must be the folder that contains 2023, 2024, ...")

    done = skipped = failed = before = after = 0
    for root, _, files in os.walk(src):
        for name in files:
            stem, ext = os.path.splitext(name)
            if ext.lower() not in IMAGES:
                skipped += 1
                continue
            rel = os.path.relpath(os.path.join(root, name), src).replace("\\", "/").lower()
            if only is not None and rel not in only:
                skipped += 1
                continue
            if SIZE_COPY.search(stem):
                skipped += 1          # WordPress size copy, the original is also in the folder
                continue
            path = os.path.join(root, name)
            out_dir = os.path.join(dst, os.path.relpath(root, src))
            out = os.path.join(out_dir, stem + ".jpg")
            try:
                im = Image.open(path)
                im = ImageOps.exif_transpose(im)
                if im.mode in ("RGBA", "LA", "P"):
                    im = im.convert("RGBA")
                    bg = Image.new("RGB", im.size, (255, 255, 255))
                    bg.paste(im, mask=im.getchannel("A"))
                    im = bg
                else:
                    im = im.convert("RGB")
                im.thumbnail((MAX, MAX))
                os.makedirs(out_dir, exist_ok=True)
                im.save(out, "JPEG", quality=QUALITY, optimize=True)
                before += os.path.getsize(path)
                after += os.path.getsize(out)
                done += 1
                if done % 200 == 0:
                    print(f"  {done} photos done...", flush=True)
            except Exception as err:
                failed += 1
                print(f"could not convert {path}: {err}", flush=True)

    if done == 0:
        print("No photos were found. Check that the folder contains year folders (2023, 2024, ...) with photos inside.")
    print(f"done: {done} photos converted, {skipped} files skipped (size copies / other), {failed} failed")
    print(f"size before: {before/1e6:,.0f} MB   after: {after/1e6:,.0f} MB")

if __name__ == "__main__":
    main()
