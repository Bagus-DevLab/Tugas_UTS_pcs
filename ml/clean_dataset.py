#!/usr/bin/env python3
"""
Clean Dataset - Remove corrupt/truncated images.

Scans all images in dataset_split/ and removes any that cannot be opened
or are truncated. Run this BEFORE training.

Usage:
    python clean_dataset.py
"""

import sys
from pathlib import Path
from PIL import Image

SCRIPT_DIR = Path(__file__).parent
DATASET_DIR = SCRIPT_DIR / "dataset_split"


def check_image(img_path: Path) -> bool:
    """Return True if image is valid, False if corrupt."""
    try:
        with Image.open(str(img_path)) as img:
            img.load()  # Force full load to detect truncation
        return True
    except Exception:
        return False


def main():
    print("=" * 60)
    print("  Dataset Cleaner - Remove Corrupt Images")
    print("=" * 60)

    if not DATASET_DIR.exists():
        print(f"\nERROR: Directory not found: {DATASET_DIR}")
        print("Run split_dataset.py first.")
        sys.exit(1)

    all_images = list(DATASET_DIR.rglob("*.jpg")) + list(DATASET_DIR.rglob("*.png"))
    total = len(all_images)
    print(f"\n  Scanning {total} images...")

    removed = 0
    for i, img_path in enumerate(all_images, 1):
        if i % 500 == 0:
            print(f"  [{i}/{total}] checked...")

        if not check_image(img_path):
            print(f"  REMOVED: {img_path.relative_to(DATASET_DIR)}")
            img_path.unlink()
            removed += 1

    print(f"\n  Done. Removed {removed} corrupt images out of {total}.")
    print(f"  Remaining: {total - removed} valid images.")


if __name__ == "__main__":
    main()
