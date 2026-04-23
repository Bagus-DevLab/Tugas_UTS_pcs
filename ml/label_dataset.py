#!/usr/bin/env python3
"""
Dataset Labeling Tool untuk Penyakit Tanaman Padi

Menampilkan foto satu per satu menggunakan system image viewer,
user memilih label via terminal input.
Foto otomatis di-copy ke subfolder sesuai label.
File ~2, ~3 (crop) otomatis ikut label foto utamanya.

Cara pakai:
    cd ml
    source venv/bin/activate
    python label_dataset.py

Kontrol (ketik di terminal lalu Enter):
    1 = Blast
    2 = Brown Spot
    3 = Tungro
    4 = Bacterial Leaf Blight
    5 = Healthy
    s = Skip (foto tidak jelas)
    u = Undo (batalkan label terakhir)
    q = Quit (progress tersimpan)
"""

import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

# ============================================================
# Configuration
# ============================================================

SCRIPT_DIR = Path(__file__).parent
SOURCE_DIR = SCRIPT_DIR / "smartfarmingimage"
OUTPUT_DIR = SCRIPT_DIR / "dataset"
PROGRESS_FILE = SCRIPT_DIR / "label_progress.json"

LABELS = {
    "1": "Blast",
    "2": "Brown Spot",
    "3": "Tungro",
    "4": "Bacterial Leaf Blight",
    "5": "Healthy",
}

VALID_KEYS = set(LABELS.keys()) | {"s", "u", "q"}

# ============================================================
# Helpers
# ============================================================


def get_base_images(source_dir: Path) -> list[Path]:
    """Get only base images (exclude ~2, ~3 crops)."""
    all_files = sorted(source_dir.glob("*.jpg"))
    return [f for f in all_files if "~" not in f.name]


def get_variants(base_path: Path) -> list[Path]:
    """Get all variants (~2, ~3, etc.) of a base image."""
    stem = base_path.stem
    return sorted(base_path.parent.glob(f"{stem}~*.jpg"))


def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, "r") as f:
            return json.load(f)
    return {"labeled": {}, "skipped": [], "history": []}


def save_progress(progress: dict):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)


def copy_image(src: Path, label: str):
    dest_dir = OUTPUT_DIR / label
    dest_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(str(src), str(dest_dir / src.name))


def open_image(img_path: Path):
    """Open image with system default viewer (non-blocking)."""
    system = platform.system()
    try:
        if system == "Linux":
            # Try common Linux image viewers
            for viewer in ["xdg-open", "eog", "feh", "display", "xdg-open"]:
                if shutil.which(viewer):
                    return subprocess.Popen(
                        [viewer, str(img_path)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
        elif system == "Darwin":
            return subprocess.Popen(["open", str(img_path)])
        elif system == "Windows":
            os.startfile(str(img_path))
            return None
    except Exception:
        pass
    return None


def close_viewer(process):
    """Close the image viewer process."""
    if process is not None:
        try:
            process.terminate()
            process.wait(timeout=1)
        except Exception:
            try:
                process.kill()
            except Exception:
                pass


def undo_last(progress: dict) -> bool:
    if not progress["history"]:
        print("  ❌ Tidak ada aksi untuk di-undo.")
        return False

    last = progress["history"].pop()
    base_name = last["base"]

    if last["action"] == "skip":
        progress["skipped"].remove(base_name)
        print(f"  ↩ Undo: {base_name} dikembalikan dari skip.")
    else:
        label = last["label"]
        if base_name in progress["labeled"]:
            del progress["labeled"][base_name]
        for fname in last.get("files", []):
            dest = OUTPUT_DIR / label / fname
            if dest.exists():
                dest.unlink()
        print(f"  ↩ Undo: {base_name} dikembalikan dari '{label}'.")

    save_progress(progress)
    return True


def print_stats(progress: dict):
    """Print current labeling statistics."""
    counts = {}
    for label in LABELS.values():
        counts[label] = sum(1 for v in progress["labeled"].values() if v == label)

    parts = [f"{k}: {v}" for k, v in counts.items() if v > 0]
    if parts:
        print(f"  📊 {' | '.join(parts)}")


# ============================================================
# Main
# ============================================================


def main():
    print("=" * 60)
    print("  Dataset Labeling Tool - Penyakit Tanaman Padi")
    print("=" * 60)

    if not SOURCE_DIR.exists():
        print(f"\n  ERROR: Folder sumber tidak ditemukan: {SOURCE_DIR}")
        sys.exit(1)

    base_images = get_base_images(SOURCE_DIR)
    total_base = len(base_images)
    all_files = list(SOURCE_DIR.glob("*.jpg"))

    if total_base == 0:
        print(f"\n  Tidak ada foto ditemukan di {SOURCE_DIR}")
        sys.exit(1)

    print(f"\n  Total file  : {len(all_files)}")
    print(f"  Foto utama  : {total_base}")
    print(f"  Foto crop   : {len(all_files) - total_base}")

    progress = load_progress()
    done_names = set(progress["labeled"].keys()) | set(progress["skipped"])

    print(f"\n  Sudah dilabel: {len(progress['labeled'])}")
    print(f"  Sudah di-skip: {len(progress['skipped'])}")
    print(f"  Tersisa      : {total_base - len(done_names)}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for label in LABELS.values():
        (OUTPUT_DIR / label).mkdir(parents=True, exist_ok=True)

    remaining = [img for img in base_images if img.name not in done_names]

    if not remaining:
        print("\n  Semua foto sudah dilabel!")
        print_summary(progress)
        return

    print("\n  Kontrol (ketik lalu tekan Enter):")
    print("  ┌─────────────────────────────────┐")
    print("  │  1 = Blast                       │")
    print("  │  2 = Brown Spot                  │")
    print("  │  3 = Tungro                      │")
    print("  │  4 = Bacterial Leaf Blight       │")
    print("  │  5 = Healthy                     │")
    print("  │  s = Skip    u = Undo   q = Quit │")
    print("  └─────────────────────────────────┘")
    print()

    viewer_process = None
    current_idx = 0

    try:
        while current_idx < len(remaining):
            img_path = remaining[current_idx]
            variants = get_variants(img_path)
            all_related = [img_path] + variants

            labeled_count = len(progress["labeled"]) + len(progress["skipped"])
            global_idx = labeled_count + current_idx + 1
            variant_info = f" (+{len(variants)} crop)" if variants else ""

            # Close previous viewer
            close_viewer(viewer_process)

            # Open image
            viewer_process = open_image(img_path)

            # Prompt
            print(f"\n  [{global_idx}/{total_base}] {img_path.name}{variant_info}")
            print_stats(progress)

            # Get input
            while True:
                try:
                    choice = input("  Label > ").strip().lower()
                except (EOFError, KeyboardInterrupt):
                    choice = "q"

                if choice in VALID_KEYS:
                    break
                print("  ⚠ Input tidak valid. Ketik 1-5, s, u, atau q.")

            if choice == "q":
                print(f"\n  Progress tersimpan. {labeled_count}/{total_base} selesai.")
                break

            elif choice == "u":
                if undo_last(progress):
                    if current_idx > 0:
                        current_idx -= 1
                continue

            elif choice == "s":
                progress["skipped"].append(img_path.name)
                progress["history"].append({"base": img_path.name, "action": "skip"})
                save_progress(progress)
                print(f"  ⏭ SKIPPED")
                current_idx += 1

            elif choice in LABELS:
                label = LABELS[choice]
                moved_files = []

                for f in all_related:
                    copy_image(f, label)
                    moved_files.append(f.name)

                progress["labeled"][img_path.name] = label
                progress["history"].append({
                    "base": img_path.name,
                    "action": "label",
                    "label": label,
                    "files": moved_files,
                })
                save_progress(progress)
                print(f"  ✅ {label} ({len(moved_files)} file)")
                current_idx += 1

    finally:
        close_viewer(viewer_process)

    print_summary(progress)


def print_summary(progress: dict):
    print("\n" + "=" * 60)
    print("  Ringkasan Labeling")
    print("=" * 60)

    total = 0
    for label in LABELS.values():
        label_dir = OUTPUT_DIR / label
        count = len(list(label_dir.glob("*.jpg"))) if label_dir.exists() else 0
        total += count
        print(f"  {label:30s}: {count:4d} foto")

    print(f"  {'TOTAL':30s}: {total:4d} foto")
    print(f"  {'Skipped':30s}: {len(progress['skipped']):4d} foto")
    print(f"\n  Dataset tersimpan di: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
