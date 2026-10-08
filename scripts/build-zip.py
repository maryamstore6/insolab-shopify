#!/usr/bin/env python3
"""Build insolab-shopify-theme.zip with the theme files at the ZIP ROOT.

Shopify rejects an uploaded theme whose entries are wrapped in a folder
(e.g. insolab-shopify/layout/theme.liquid). This script walks only the
recognised theme folders and writes every entry relative to the repo root,
so the zip contains layout/theme.liquid, sections/..., assets/... directly.

Usage:  python3 scripts/build-zip.py [output.zip]
"""
import os
import sys
import zipfile

THEME_DIRS = ["assets", "config", "layout", "locales", "sections", "snippets", "templates"]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "insolab-shopify-theme.zip")


def main() -> int:
    os.chdir(ROOT)
    missing = [d for d in THEME_DIRS if not os.path.isdir(d)]
    if missing:
        print("ERROR: missing theme folders:", ", ".join(missing), file=sys.stderr)
        return 1

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        for d in THEME_DIRS:
            for root, _dirs, files in os.walk(d):
                for name in sorted(files):
                    path = os.path.join(root, name)
                    z.write(path, os.path.relpath(path, ROOT))

    with zipfile.ZipFile(OUT) as z:
        names = z.namelist()

    tops = sorted({n.split("/")[0] for n in names})
    wrapped = [n for n in names if n.split("/")[0] not in THEME_DIRS]
    size_mb = os.path.getsize(OUT) / 1024 / 1024

    print(f"wrote {OUT}")
    print(f"  entries : {len(names)}")
    print(f"  size    : {size_mb:.2f} MB")
    print(f"  folders : {', '.join(tops)}")

    if wrapped:
        print("  ERROR: entries outside the theme folders:", wrapped[:5], file=sys.stderr)
        return 1
    if "layout/theme.liquid" not in names:
        print("  ERROR: layout/theme.liquid missing", file=sys.stderr)
        return 1
    print("  OK: no wrapping folder, layout/theme.liquid present")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
