import time
from pathlib import Path

from tqdm import tqdm

from Extractor import Extract
from ReviewParser import ParseReview
from Saving import AppendCSV, CheckAppid
from Search import SearchService
from SystemParser import ParseSysReq
from appDetails import AppDetails
from tagParser import ParseTag


APP_STORE_URL = "https://store.steampowered.com/app/{appid}/"


class SteamCrawler:
    def __init__(self, http, cfg, CSVpath: str):
        self.cfg = cfg
        self.http = http
        self.search = SearchService(http)
        self.appdetails = AppDetails(http, cfg)
        self.CSVpath = str(Path(CSVpath).expanduser().resolve())
        Path(self.CSVpath).parent.mkdir(parents=True, exist_ok=True)

    def crawl(self):
        all_appids = self.search.FetchPage(self.cfg)
        crawled_ids = CheckAppid(self.CSVpath)
        appids = [appid for appid in all_appids if appid not in crawled_ids]
        results = []

        for rank, appid in enumerate(tqdm(appids, desc="Crawling games"), start=1):
            try:
                data = self.appdetails.fetch(appid)
                if not data:
                    continue

                row = Extract(appid, data)
                resp = self.http.get(
                    APP_STORE_URL.format(appid=appid),
                    {"cc": self.cfg.cc, "l": self.cfg.lang},
                )
                html = resp.text if resp else ""

                row["Tags"] = ParseTag(html)
                score, posi, nega = ParseReview(self.http, appid)
                row["ReviewScore"] = score
                row["PositiveReview"] = posi
                row["NegativeReview"] = nega

                os_req, mem_req, cpu_req = ParseSysReq(html)
                row["OsRequirement"] = os_req
                row["MemoryRequirement"] = mem_req
                row["CpuRequirement"] = cpu_req
                row["Rank"] = rank

                AppendCSV(row, self.CSVpath)
                results.append(row)
            except Exception as e:
                print(f"Skip appid {appid}: {e}")
            finally:
                time.sleep(self.cfg.sleep_seconds)

        return results
