#!/usr/bin/env python3
"""Embed COMMUNITY-HUB.css into COMMUNITY-HUB.html and MAINTAINER-FORM.html."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSS = (ROOT / "COMMUNITY-HUB.css").read_text(encoding="utf-8")

HUB_INTRO = (
    "<!-- Inlined from COMMUNITY-HUB.css — hub shell works if external sheet "
    "404s (path/base/CCE). Re-run: python3 sync-hub-css.py -->"
)
FORM_INTRO = (
    "<!-- Same `.ch-*` skin as hub; inlined for iframe reliability. "
    "Re-run: python3 sync-hub-css.py -->"
)


def replace_inlined_style(html: str, intro: str) -> str:
    block = f"    {intro}\n    <style id=\"ch-hub-inlined-css\">\n{CSS}\n    </style>\n"
    pat = r"    <!--.*?-->\n    <style id=\"ch-hub-inlined-css\">.*?</style>\n"
    if not re.search(pat, html, flags=re.DOTALL):
        raise SystemExit("Could not find #ch-hub-inlined-css block to replace.")
    return re.sub(pat, block, html, count=1, flags=re.DOTALL)


def main() -> None:
    hub = (ROOT / "COMMUNITY-HUB.html").read_text(encoding="utf-8")
    (ROOT / "COMMUNITY-HUB.html").write_text(
        replace_inlined_style(hub, HUB_INTRO), encoding="utf-8"
    )
    form = (ROOT / "MAINTAINER-FORM.html").read_text(encoding="utf-8")
    (ROOT / "MAINTAINER-FORM.html").write_text(
        replace_inlined_style(form, FORM_INTRO), encoding="utf-8"
    )
    print("Updated COMMUNITY-HUB.html and MAINTAINER-FORM.html from COMMUNITY-HUB.css")


if __name__ == "__main__":
    main()
