#!/usr/bin/env python3
"""Clean source dataset by quarantining invalid files and duplicates.

This scans ml/dataset/ before splitting. Files are moved to
ml/dataset/_quarantine/ instead of being deleted, so every decision remains
auditable.
"""

import hashlib
import shutil
from pathlib import Path
from collections import defaultdict
from PIL import Image

SCRIPT_DIR = Path(__file__).parent
DATASET_DIR = SCRIPT_DIR / "dataset"
QUARANTINE_DIR = DATASET_DIR / "_quarantine"
SKIP_FOLDERS = {"_skipped", "_quarantine", "dataset"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def check_image(img_path: Path) -> bool:
    """Return True if image is valid, False if corrupt."""
    try:
        with Image.open(str(img_path)) as img:
            img.load()  # Force full load to detect truncation
        return True
    except Exception:
        return False


def iter_class_dirs():
    return [
        path for path in sorted(DATASET_DIR.iterdir())
        if path.is_dir() and path.name not in SKIP_FOLDERS
    ]


def iter_images(class_dirs):
    for class_dir in class_dirs:
        for path in sorted(class_dir.iterdir()):
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
                yield path


def quarantine(path: Path, reason: str) -> Path:
    rel = path.relative_to(DATASET_DIR)
    dest = QUARANTINE_DIR / reason / rel
    dest.parent.mkdir(parents=True, exist_ok=True)

    if dest.exists():
        stem = dest.stem
        suffix = dest.suffix
        counter = 1
        while dest.exists():
            dest = dest.with_name(f"{stem}__{counter}{suffix}")
            counter += 1

    shutil.move(str(path), str(dest))
    return dest


def main():
    print("=" * 60)
    print("  Dataset Cleaner - Quarantine Invalid Files and Duplicates")
    print("=" * 60)

    if not DATASET_DIR.exists():
        print(f"\nERROR: Directory not found: {DATASET_DIR}")
        return

    class_dirs = iter_class_dirs()
    print(f"\n  Source classes: {len(class_dirs)}")

    metadata_files = sorted(DATASET_DIR.rglob("*:Zone.Identifier"))
    for path in metadata_files:
        quarantine(path, "metadata")
    print(f"  Metadata files quarantined: {len(metadata_files)}")

    all_images = list(iter_images(class_dirs))
    total = len(all_images)
    print(f"\n  Scanning {total} images...")

    invalid = 0
    valid_images = []
    for i, img_path in enumerate(all_images, 1):
        if i % 500 == 0:
            print(f"  [{i}/{total}] checked...")

        if not check_image(img_path):
            print(f"  INVALID: {img_path.relative_to(DATASET_DIR)}")
            quarantine(img_path, "invalid")
            invalid += 1
        else:
            valid_images.append(img_path)

    hashes = defaultdict(list)
    for img_path in valid_images:
        if not img_path.exists():
            continue
        digest = hashlib.sha256(img_path.read_bytes()).hexdigest()
        hashes[digest].append(img_path)

    cross_class_groups = [
        paths for paths in hashes.values()
        if len({path.parent.name for path in paths}) > 1
    ]
    cross_class_files = {path for paths in cross_class_groups for path in paths}
    for path in sorted(cross_class_files):
        if path.exists():
            quarantine(path, "cross_class_duplicates")

    duplicate_files = 0
    for paths in hashes.values():
        remaining = [path for path in sorted(paths) if path.exists()]
        by_class = defaultdict(list)
        for path in remaining:
            by_class[path.parent.name].append(path)

        for class_paths in by_class.values():
            for duplicate in class_paths[1:]:
                if duplicate.exists():
                    quarantine(duplicate, "same_class_duplicates")
                    duplicate_files += 1

    print(f"\n  Done.")
    print(f"  Invalid images quarantined: {invalid}")
    print(f"  Cross-class duplicate groups: {len(cross_class_groups)}")
    print(f"  Cross-class duplicate files quarantined: {len(cross_class_files)}")
    print(f"  Same-class duplicate files quarantined: {duplicate_files}")
    print(f"  Quarantine folder: {QUARANTINE_DIR}")


if __name__ == "__main__":
    main()
