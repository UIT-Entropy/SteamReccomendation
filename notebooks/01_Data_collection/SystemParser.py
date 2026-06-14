import re
from bs4 import BeautifulSoup
from typing import Optional, Tuple
def ParseSysReq(html: str):
    soup = BeautifulSoup(html, "html.parser")
    block = soup.find("div", class_=lambda c: c and "game_area_sys_req" in c)
    if not block:
        return None, None, None
    osReq = memoryReq = cpuReq = None
    for li in block.find_all("li"):
        strong = li.find("strong")
        if not strong:
            continue
        label = strong.get_text(strip=True).lower()
        text = li.get_text(" ", strip=True)
        text = text.replace(strong.get_text(strip=True), "").strip(" :")
        if "os" in label and not osReq:
            osReq = text
        elif "memory" in label and not memoryReq:
            memoryReq = text
        elif "processor" in label and not cpuReq:
            cpuReq = text
    return osReq, memoryReq, cpuReq