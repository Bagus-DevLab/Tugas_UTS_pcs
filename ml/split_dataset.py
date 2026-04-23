#!/usr/bin/env python3
"""
Split Dataset into Train / Validation / Test sets.

Reads from ml/dataset/ (labeled images in class subfolders),
normalizes folder names, and splits into:
    ml/dataset_split/
    ├── train/
    │   ├── Bacterial Leaf Blight/
    │   ├── Blast/
    │   └── ...
    ├── val/
    │   └── ...
    └── test/
        └── ...

Usage:
    cd ml
    python split_dataset.py
"""

import os
import random
import shutil
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
SOURCE_DIR = SCRIPT_DIR / "dataset"
OUTPUT_DIR = SCRIPT_DIR / "dataset_split"

TRAIN_RATIO = 0.80
VAL_RATIO = 0.10
TEST_RATIO = 0.10

SEED = 42

# Mapping: raw folder name -> normalized class name
# Must match CLASS_LABELS in train_model.py and ml-model.ts
FOLDER_MAP = {
    "Bacterial Leaf Blight": "Bacterial Leaf Blight",
    "Blast": "Blast",
    "Brown Spot": "Brown Spot",
    "Healthy": "Healthy",
    "Tungro": "Tungro",
    "hispa": "Hispa",
    "dead_heart": "Dead Heart",
    "downy_mildew": "Downy Mildew",
    "bacterial_leaf_streak": "Bacterial Leaf Streak",
    "bacterial_panicle_blight": "Bacterial Panicle Blight",
    "Leaf smut": "Leaf Smut",
}

SKIP_FOLDERS = {"_skipped"}


def main():
    print("=" * 60)
    print("  Dataset Splitter - Train / Val / Test")
    print("=" * 60)

    if not SOURCE_DIR.exists():
        print(f"\nERROR: Source directory not found: {SOURCE_DIR}")
        print("Run label_dataset.py first to label your images.")
        return

    # Clean output
    if OUTPUT_DIR.exists():
        print(f"\n  Menghapus output lama: {OUTPUT_DIR}")
        shutil.rmtree(OUTPUT_DIR)

    random.seed(SEED)

    total_train = 0
    total_val = 0
    total_test = 0

    print(f"\n  Source : {SOURCE_DIR}")
    print(f"  Output : {OUTPUT_DIR}")
    print(f"  Split  : {TRAIN_RATIO:.0%} train / {VAL_RATIO:.0%} val / {TEST_RATIO:.0%} test")
    print()

    # Process each class folder
    for raw_folder in sorted(SOURCE_DIR.iterdir()):
        if not raw_folder.is_dir():
            continue
        if raw_folder.name in SKIP_FOLDERS:
            continue

        # Normalize class name
        class_name = FOLDER_MAP.get(raw_folder.name)
        if class_name is None:
            print(f"  ⚠ Folder tidak dikenali, skip: {raw_folder.name}")
            continue

        # Get all images
        images = sorted(list(raw_folder.glob("*.jpg")) + list(raw_folder.glob("*.png")))
        if not images:
            print(f"  ⚠ Folder kosong, skip: {raw_folder.name}")
            continue

        # Shuffle
        random.shuffle(images)

        # Split
        n = len(images)
        n_train = int(n * TRAIN_RATIO)
        n_val = int(n * VAL_RATIO)
        # n_test = rest

        train_imgs = images[:n_train]
        val_imgs = images[n_train : n_train + n_val]
        test_imgs = images[n_train + n_val :]

        # Copy files
        for split_name, split_imgs in [("train", train_imgs), ("val", val_imgs), ("test", test_imgs)]:
            dest_dir = OUTPUT_DIR / split_name / class_name
            dest_dir.mkdir(parents=True, exist_ok=True)
            for img in split_imgs:
                shutil.copy2(str(img), str(dest_dir / img.name))

        total_train += len(train_imgs)
        total_val += len(val_imgs)
        total_test += len(test_imgs)

        print(
            f"  {class_name:30s}: {n:5d} total -> "
            f"train {len(train_imgs):4d} / val {len(val_imgs):4d} / test {len(test_imgs):4d}"
        )

    print()
    print(f"  {'TOTAL':30s}: {total_train + total_val + total_test:5d} total -> "
          f"train {total_train:4d} / val {total_val:4d} / test {total_test:4d}")
    print(f"\n  Output tersimpan di: {OUTPUT_DIR}")
    print("  Selanjutnya jalankan: python train_model.py")


if __name__ == "__main__":
    main()
