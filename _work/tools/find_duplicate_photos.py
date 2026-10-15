"""Find repeated member photos (same person, same picture) in the member photo folder.

Run on your own computer (needs Python 3 and Pillow). It changes NOTHING; it only writes a report.
    python find_duplicate_photos.py "C:/path/to/members-photos"

Output (in the same folder as this script):
    duplicates_report.csv   every repeated photo, with the copy to KEEP and the copy to REMOVE
    to_remove.txt           the paths to delete, one per line (relative to the photos folder)

Rules:
- Two photos are repeats only when the names match (ignoring case, spaces, hyphens and a trailing number)
  AND the pictures look the same (picture fingerprint). Different people with the same name are kept.
- Of each group, the largest file is KEPT (usually the best quality). The others are listed for removal.
"""
import csv
import os
import re
import sys
from PIL import Image

IMAGES = (".jpg", ".jpeg", ".png", ".webp")
MAX_DISTANCE = 6          # how different two picture fingerprints may be (0 = identical)

def norm_name(stem):
    s = re.sub(r"^.*?\.{2,}\s*", "", stem)          # "Interview...-Name"
    s = re.sub(r"-(scaled|\d+x\d+)$", "", s, flags=re.I)
    s = re.sub(r"[\s\-_.]+\d+$", "", s)              # trailing copy number: "Name 1", "Name-2"
    return re.sub(r"[\s\-_.]+", "", s).lower()

def fingerprint(path):
    """Difference hash: 64 bits that describe the picture's shape. Same picture -> same bits."""
    im = Image.open(path).convert("L").resize((9, 8), Image.LANCZOS)
    px = list(im.get_flattened_data()) if hasattr(im, "get_flattened_data") else list(im.getdata())
    bits = 0
    for row in range(8):
        for col in range(8):
            bits = (bits << 1) | (1 if px[row * 9 + col] > px[row * 9 + col + 1] else 0)
    return bits

def distance(a, b):
    return bin(a ^ b).count("1")

def main():
    if len(sys.argv) != 2:
        sys.exit('Usage: python find_duplicate_photos.py "<members photos folder>"')
    root = sys.argv[1]
    if not os.path.isdir(root):
        sys.exit(f"ERROR: folder not found: {root}")

    groups = {}
    for dirpath, _, files in os.walk(root):
        for name in files:
            if not name.lower().endswith(IMAGES):
                continue
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, root).replace("\\", "/")
            key = norm_name(os.path.splitext(name)[0])
            groups.setdefault(key, []).append((rel, full))

    report, remove = [], []
    for key, items in groups.items():
        if len(items) < 2:
            continue
        prints = []
        for rel, full in items:
            try:
                prints.append((rel, full, fingerprint(full), os.path.getsize(full)))
            except Exception as err:
                print(f"skipped (cannot read) {rel}: {err}")
        # cluster the copies that look the same
        used = set()
        for i, (rel_a, _, fp_a, size_a) in enumerate(prints):
            if i in used:
                continue
            cluster = [(rel_a, size_a)]
            for j in range(i + 1, len(prints)):
                rel_b, _, fp_b, size_b = prints[j]
                if j not in used and distance(fp_a, fp_b) <= MAX_DISTANCE:
                    cluster.append((rel_b, size_b))
                    used.add(j)
            if len(cluster) > 1:
                cluster.sort(key=lambda c: -c[1])        # keep the largest file
                keep = cluster[0][0]
                for rel, _ in cluster[1:]:
                    report.append((key, keep, rel))
                    remove.append(rel)
            used.add(i)

    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "duplicates_report.csv"), "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.writer(fh)
        w.writerow(["name", "keep", "remove"])
        w.writerows(report)
    with open(os.path.join(here, "to_remove.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(remove) + ("\n" if remove else ""))

    print(f"repeated photos found: {len(remove)}")
    print("report: duplicates_report.csv   list to delete: to_remove.txt")

if __name__ == "__main__":
    main()
