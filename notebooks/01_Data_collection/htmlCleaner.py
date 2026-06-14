import re
from bs4 import BeautifulSoup
from typing import Optional

def Cleaner(html: Optional[str]) -> str:
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    return re.sub(r"\s+", " ", text)