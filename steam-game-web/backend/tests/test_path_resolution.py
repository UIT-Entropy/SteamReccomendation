import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.utils import resolve_data_path


def test_resolve_data_path_finds_dataset_file():
    data_path = resolve_data_path("data", "processed", "SteamGames_cleaned.csv")

    assert isinstance(data_path, Path)
    assert data_path.exists()
    assert data_path.is_file()
    assert data_path.parent.name == "processed"
    assert data_path.name == "SteamGames_cleaned.csv"
