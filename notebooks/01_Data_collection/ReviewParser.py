from typing import Optional, Tuple


REVIEW_FALLBACK_PARAMS = [
    {
        "json": 1,
        "filter": "summary",
        "language": "all",
        "purchase_type": "all",
        "num_per_page": 0,
    },
    {
        "json": 1,
        "filter": "summary",
        "language": "english",
        "purchase_type": "all",
        "num_per_page": 0,
    },
    {
        "json": 1,
        "filter": "summary",
        "language": "all",
        "purchase_type": "steam",
        "num_per_page": 0,
    },
    {
        "json": 1,
        "filter": "all",
        "language": "all",
        "purchase_type": "all",
        "num_per_page": 1,
    },
]


def _to_int_or_none(value):
    try:
        if value is None:
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def _fetch_review_summary(http, appid: int, params: dict) -> Tuple[Optional[int], Optional[int], Optional[int]]:
    url = f"https://store.steampowered.com/appreviews/{appid}"
    try:
        resp = http.get(url, params=params)
        if not resp:
            return None, None, None
        data = resp.json()
        if not data.get("success"):
            return None, None, None
        summary_data = data.get("query_summary", {})
        review_score = _to_int_or_none(summary_data.get("review_score"))
        positive = _to_int_or_none(summary_data.get("total_positive"))
        negative = _to_int_or_none(summary_data.get("total_negative"))
        return review_score, positive, negative
    except Exception:
        return None, None, None


def ParseReview(http, appid: int) -> Tuple[Optional[int], Optional[int], Optional[int]]:
    best_result = (None, None, None)

    for params in REVIEW_FALLBACK_PARAMS:
        score, positive, negative = _fetch_review_summary(http, appid, params)
        if score is None or positive is None or negative is None:
            continue

        best_result = (score, positive, negative)
        if positive > 0 or negative > 0 or score > 0:
            return best_result

    return best_result

