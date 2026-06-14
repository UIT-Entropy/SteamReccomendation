from bs4 import BeautifulSoup

def ParseTag(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    tags = []
    container = soup.find("div", class_=lambda c: c and "glance_tags" in c)
    if container:
        for a in container.find_all("a", class_="app_tag"):
            txt = a.get_text(strip=True)
            if txt:
                tags.append(txt)
    return ",".join(dict.fromkeys(tags))