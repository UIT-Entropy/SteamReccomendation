import logging
import sys
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)


def get_logger(name: str):
    """Return a configured logger."""
    return logging.getLogger(name)


def resolve_data_path(*relative_parts: str) -> Path:
    """Resolve data files from backend or project root."""
    backend_root = Path(__file__).resolve().parent.parent
    search_roots = [backend_root, *backend_root.parents]
    candidates = []

    for root in search_roots:
        candidates.append(root.joinpath(*relative_parts))
        if relative_parts and relative_parts[0] != "data":
            candidates.append(root.joinpath("data", *relative_parts))

    for candidate in candidates:
        if candidate.exists():
            return candidate

    return candidates[0]
