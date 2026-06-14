from htmlCleaner import Cleaner

def Extract(appid: int, d: dict) -> dict:
    price = d.get("price_overview")
    if price and price.get("final") is not None:
        finalPrice = price.get("final") / 100
    else:
        finalPrice = 0
    thumbnail = d.get("header_image") or {}
    return {
        "Appid": appid,
        "Name": d.get("name"),
        "Type": d.get("type"),
        "ReleaseDate": (d.get("release_date") or {}).get("date"),
        "Genres": ",".join(
            g.get("description", "")
            for g in (d.get("genres") or [])
            if g.get("description")
        ),
        "Developers": ",".join(d.get("developers") or []),
        "Publishers": ",".join(d.get("publishers") or []),
        "Description": Cleaner(d.get("detailed_description")),
        "price": f"{finalPrice}$",
        "Thumbnail" : thumbnail,
    }