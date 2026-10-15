"""Make a small copy of the WordPress 'uploads' photo folder, ready to send.

Run on your own computer (needs Python 3 and Pillow):
    pip install pillow
    python shrink_uploads.py "C:/path/to/uploads" "C:/path/to/uploads-small"

Every photo is made at most 900 pixels wide/high and saved with good quality.
Folder structure is kept. Other files are skipped. Originals are not changed.
"""
import os
import sys
from PIL import Image

MAX = 900          # largest side in pixels
QUALITY = 80       # JPEG quality (80 looks clean, much smaller)
IMAGES = (".jpg", ".jpeg", ".png", ".webp")

src, dst = sys.argv[1], sys.argv[2]
before = after = count = skipped = 0

for root, _, files in os.walk(src):
    for name in files:
        if not name.lower().endswith(IMAGES):
            skipped += 1
            continue
        path = os.path.join(root, name)
        out_dir = os.path.join(dst, os.path.relpath(root, src))
        os.makedirs(out_dir, exist_ok=True)
        out = os.path.join(out_dir, name)
        before += os.path.getsize(path)
        try:
            im = Image.open(path)
            im.thumbnail((MAX, MAX))          # keeps the proportions
            if name.lower().endswith(".png"):
                im.save(out, optimize=True)
            else:
                im.convert("RGB").save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
                if not name.lower().endswith((".jpg", ".jpeg")):
                    out = os.path.splitext(out)[0] + ".jpg"
            after += os.path.getsize(out)
            count += 1
        except Exception as err:
            print("could not read", path, err)

print(f"done: {count} photos, {skipped} other files skipped")
print(f"size before: {before/1e6:,.0f} MB   after: {after/1e6:,.0f} MB")
