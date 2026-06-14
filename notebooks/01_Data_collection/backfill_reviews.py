import argparse
import sys
import time
from pathlib import Path

import pandas as pd
from tqdm import tqdm

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_COLLECTION_DIR = Path(__file__).resolve().parent
for path in [PROJECT_ROOT, DATA_COLLECTION_DIR]:
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from Config import Config
from Client import Client
from ReviewParser import ParseReview
from path_utils import ensure_data_layout


REVIEW_COLS = ["ReviewScore", "PositiveReview", "NegativeReview"]


def needs_review_backfill(row, include_zero_reviews):
    values = pd.to_numeric(row[REVIEW_COLS], errors="coerce")
    if values.isna().any():
        return True
    if include_zero_reviews:
        return int(values["PositiveReview"]) == 0 and int(values["NegativeReview"]) == 0
    return False


def backfill_reviews(include_zero_reviews=True, limit=None, backup=False):
    paths = ensure_data_layout(PROJECT_ROOT)
    raw_path = Path(paths["raw_path"])

    if not raw_path.exists():
        raise FileNotFoundError(f"Raw CSV not found: {raw_path}")

    df = pd.read_csv(raw_path)
    if not {"Appid", *REVIEW_COLS}.issubset(df.columns):
        missing = sorted({"Appid", *REVIEW_COLS} - set(df.columns))
        raise ValueError(f"Missing columns in raw CSV: {missing}")

    target_mask = df.apply(
        lambda row: needs_review_backfill(row, include_zero_reviews),
        axis=1,
    )
    target_indices = df.index[target_mask].tolist()
    if limit is not None:
        target_indices = target_indices[:limit]

    print("Raw CSV:", raw_path)
    print("Rows to backfill:", len(target_indices))
    if not target_indices:
        return

    if backup:
        import shutil

        backup_path = raw_path.with_suffix(".reviews-backup.csv")
        shutil.copy2(raw_path, backup_path)
        print("Backup saved:", backup_path)

    cfg = Config()
    http = Client(cfg)
    updated = 0
    failed = 0

    for idx in tqdm(target_indices, desc="Backfilling reviews"):
        appid = int(df.at[idx, "Appid"])
        score, positive, negative = ParseReview(http, appid)

        if score is None or positive is None or negative is None:
            failed += 1
            continue

        df.at[idx, "ReviewScore"] = int(score)
        df.at[idx, "PositiveReview"] = int(positive)
        df.at[idx, "NegativeReview"] = int(negative)
        updated += 1
        time.sleep(cfg.sleep_seconds)

    df.to_csv(raw_path, index=False, encoding="utf-8-sig")
    print("Updated rows:", updated)
    print("Failed rows:", failed)
    print("Saved:", raw_path)


def parse_args():
    parser = argparse.ArgumentParser(description="Backfill missing or suspicious Steam review fields in raw CSV.")
    parser.add_argument(
        "--missing-only",
        action="store_true",
        help="Only refill NaN review fields. By default, also retries rows where positive and negative reviews are both 0.",
    )
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of rows to retry.")
    parser.add_argument("--backup", action="store_true", help="Create SteamGames.reviews-backup.csv before saving.")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    backfill_reviews(include_zero_reviews=not args.missing_only, limit=args.limit, backup=args.backup)
