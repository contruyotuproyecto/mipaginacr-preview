"""Release only articles whose Costa Rica publication time has arrived."""

from __future__ import annotations

import base64
from datetime import datetime, timezone
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / ".scheduled" / "news-2026-10-26.bin"
WORKFLOW = ROOT / ".github" / "workflows" / "publish-news-2026-10-26.yml"
SCRIPT = Path(__file__).resolve()
ARTICLE_IDS = (
    "chocoquqi-nostalgia-marketing",
    "sinpe-movil-registro-hacienda",
    "centro-datos-ia-limon",
)
TIMES_UTC = (15, 19, 23)  # 09:00, 13:00 and 17:00 in Costa Rica.


def run(*args: str) -> None:
    subprocess.run(args, cwd=ROOT, check=True)


def main() -> None:
    now = datetime.now(timezone.utc)
    verify_only = os.environ.get("NEWS_VERIFY_ONLY") == "1"
    publish_all = os.environ.get("NEWS_PUBLISH_ALL") == "1"
    if now.date().isoformat() != "2026-10-26":
        print("Outside the approved publication day; no change.")
        return

    due = list(range(1, len(ARTICLE_IDS) + 1)) if publish_all else [
        i for i, hour in enumerate(TIMES_UTC, 1) if now.hour >= hour
    ]
    if not due and not verify_only:
        print("No release is due yet.")
        return
    if not BUNDLE.exists():
        print("All releases have been completed; no bundle remains.")
        return

    key_text = os.environ.get("NEWS_RELEASE_KEY", "")
    if not key_text:
        raise RuntimeError("NEWS_RELEASE_KEY is not configured")
    key = base64.urlsafe_b64decode(key_text)
    if len(key) != 32:
        raise RuntimeError("Invalid release key length")
    sealed = BUNDLE.read_bytes()
    plain = AESGCM(key).decrypt(sealed[:12], sealed[12:], b"mipaginacr-news-2026-10-26")

    with tempfile.TemporaryDirectory() as directory:
        temp = Path(directory)
        with tarfile.open(fileobj=io.BytesIO(plain), mode="r:gz") as archive:
            members = archive.getmembers()
            if any(not m.isfile() or m.name.startswith("/") or ".." in Path(m.name).parts for m in members):
                raise RuntimeError("Invalid release archive")
            archive.extractall(temp, filter="data")

        manifest = json.loads((temp / "manifest.json").read_text(encoding="utf-8"))
        if [entry["slug"] for entry in manifest] != list(ARTICLE_IDS):
            raise RuntimeError("Release manifest mismatch")
        if verify_only:
            print("Encrypted release bundle and schedule verified; no article published.")
            return

        changed = False
        for i in due:
            release = manifest[i - 1]
            article = ROOT / "blog" / release["slug"] / "index.html"
            if article.exists():
                print(f"Release {i} already present.")
                continue
            release_dir = temp / "releases" / str(i)
            for file in release_dir.rglob("*"):
                if file.is_file():
                    target = ROOT / file.relative_to(release_dir)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(file, target)
            changed = True
            print(f"Release {i} staged for publication.")

        if not changed:
            print("All due releases already published.")
            return

        if len(due) == len(ARTICLE_IDS):
            BUNDLE.unlink()
            WORKFLOW.unlink()
            SCRIPT.unlink()
            print("Final release staged; one-day scheduler removed.")

        run("git", "add", "-A", "--", "blog", "assets/blog", "sitemap.xml", ".scheduled", ".github/workflows/publish-news-2026-10-26.yml", ".github/scripts/publish-news-2026-10-26.py")
        run("git", "-c", "user.name=MiPaginaCR editorial scheduler", "-c", "user.email=actions@users.noreply.github.com", "commit", "-m", f"Publish scheduled articles through {now.hour:02d}:00 UTC")
        run("git", "push", "origin", "HEAD:main")
        output = os.environ.get("GITHUB_OUTPUT")
        if output:
            with open(output, "a", encoding="utf-8") as file:
                file.write("changed=true\n")


if __name__ == "__main__":
    main()
