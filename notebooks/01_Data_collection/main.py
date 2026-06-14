import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_COLLECTION_DIR = Path(__file__).resolve().parent
for path in [PROJECT_ROOT, DATA_COLLECTION_DIR]:
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from path_utils import ensure_data_layout
from Config import Config
from Client import Client
from Crawler import SteamCrawler
from Saving import SaveJSON


def main():
    paths = ensure_data_layout(PROJECT_ROOT)
    cfg = Config(pages=600, per_page=50)
    http = Client(cfg)
    crawler = SteamCrawler(http, cfg, str(paths["raw_path"]))
    rows = crawler.crawl()
    SaveJSON({"Games": rows}, str(paths["raw_json_path"]))

    print(f"Saved raw dataset to: {paths['raw_path']}")
    print(f"Saved raw JSON to: {paths['raw_json_path']}")

if __name__ == "__main__":
    main()
