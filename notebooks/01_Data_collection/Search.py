import re
from typing import List

from bs4 import BeautifulSoup
from tqdm import tqdm


SEARCH_URL = "https://store.steampowered.com/search/results/"


class SearchService:
    def __init__(self, http):
        self.http = http

    def ParseAppid(self, html: str, limit: int) -> List[int]:
        soup = BeautifulSoup(html, "html.parser")
        seen = set()
        appids = []
        for a in soup.find_all("a", href=True):
            match = re.search(r"/app/(\d+)/", a["href"])
            if not match:
                continue
            appid = int(match.group(1))
            if appid in seen:
                continue
            seen.add(appid)
            appids.append(appid)
            if len(appids) >= limit:
                break
        return appids

    def FetchPage(self, cfg) -> List[int]:
        appids = []
        seen = set()
        for idx in tqdm(range(cfg.pages), desc="Searching app ids"):
            params = {
                "supportedlang": cfg.lang,
                "ndl": 1,
                "infinite": 1,
                "start": idx * cfg.per_page,
                "count": cfg.per_page,
                "cc": cfg.cc,
                "l": cfg.lang,
            }
            resp = self.http.get(SEARCH_URL, params)
            payload = resp.json()
            html = payload.get("results_html", "")
            new_ids = self.ParseAppid(html, cfg.per_page)
            if not new_ids:
                break
            for appid in new_ids:
                if appid not in seen:
                    seen.add(appid)
                    appids.append(appid)
        return appids
