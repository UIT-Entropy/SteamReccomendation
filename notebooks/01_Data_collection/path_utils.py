from __future__ import annotations

import shutil
from pathlib import Path
from typing import Dict


def find_project_root(start: Path | None = None) -> Path:
    """Find the project root."""
    search_start = (start or Path.cwd()).resolve()
    candidates = [search_start, *search_start.parents]

    for candidate in candidates:
        if (candidate / "readme.md").exists() and (candidate / "steam-game-web").exists():
            return candidate
        if (candidate / "data").exists() and (candidate / "notebooks").exists():
            return candidate

    return search_start


def get_data_dir(start: Path | None = None) -> Path:
    project_root = find_project_root(start)
    data_dir = project_root / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


def get_data_paths(start: Path | None = None) -> Dict[str, Path]:
    data_dir = get_data_dir(start)
    raw_dir = data_dir / "raw"
    processed_dir = data_dir / "processed"
    raw_path = raw_dir / "SteamGames.csv"
    raw_json_path = raw_dir / "SteamGames.json"
    cleaned_path = processed_dir / "SteamGames_cleaned.csv"
    raw_legacy_path = data_dir / "SteamGames.csv"
    raw_json_legacy_path = data_dir / "SteamGames.json"
    cleaned_legacy_path = data_dir / "SteamGames_cleaned.csv"

    return {
        "project_root": find_project_root(start),
        "data_dir": data_dir,
        "raw_dir": raw_dir,
        "processed_dir": processed_dir,
        "raw_path": raw_path,
        "raw_json_path": raw_json_path,
        "cleaned_path": cleaned_path,
        "raw_legacy_path": raw_legacy_path,
        "raw_json_legacy_path": raw_json_legacy_path,
        "cleaned_legacy_path": cleaned_legacy_path,
    }


def ensure_data_layout(start: Path | None = None) -> Dict[str, Path]:
    """Create data folders and copy old root-level files if present."""
    paths = get_data_paths(start)
    paths["raw_dir"].mkdir(parents=True, exist_ok=True)
    paths["processed_dir"].mkdir(parents=True, exist_ok=True)

    if paths["raw_legacy_path"].exists() and not paths["raw_path"].exists():
        shutil.copy2(paths["raw_legacy_path"], paths["raw_path"])
    if paths["raw_json_legacy_path"].exists() and not paths["raw_json_path"].exists():
        shutil.copy2(paths["raw_json_legacy_path"], paths["raw_json_path"])
    if paths["cleaned_legacy_path"].exists() and not paths["cleaned_path"].exists():
        shutil.copy2(paths["cleaned_legacy_path"], paths["cleaned_path"])

    return paths
