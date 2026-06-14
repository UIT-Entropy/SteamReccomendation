import csv
import json
from pathlib import Path
from typing import Any, Dict, List


def _resolve_output_path(path: str | Path) -> Path:
    output_path = Path(path)
    if not output_path.is_absolute():
        output_path = (Path.cwd() / output_path).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    return output_path


def SaveCSV(rows: List[Dict[str, Any]], path: str | Path):
    if not rows:
        return
    output_path = _resolve_output_path(path)
    with output_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def SaveJSON(data: Any, path: str | Path):
    output_path = _resolve_output_path(path)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def CheckAppid(path: str | Path) -> set:
    csv_path = Path(path)
    if not csv_path.exists() or csv_path.stat().st_size == 0:
        return set()
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return {int(row["Appid"]) for row in reader if row.get("Appid")}


def AppendCSV(row: Dict[str, Any], path: str | Path):
    output_path = _resolve_output_path(path)
    has_file = output_path.exists() and output_path.stat().st_size > 0
    with output_path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=row.keys())
        if not has_file:
            writer.writeheader()
        writer.writerow(row)
