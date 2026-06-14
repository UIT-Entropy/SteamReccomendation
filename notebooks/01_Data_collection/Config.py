from dataclasses import dataclass


@dataclass
class Config:
    cc: str = "us"
    lang: str = "english"
    pages: int = 6000
    per_page: int = 50
    sleep_seconds: float = 1.0
    timeout_seconds: int = 25
    max_retries: int = 10
    partial_save_every: int = 25
