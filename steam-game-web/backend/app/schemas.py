from pydantic import BaseModel
from typing import List, Optional

class StatResponse(BaseModel):
    total_games: int
    free_games: int
    paid_games: int
    unique_tags: int
    unique_developers: int
    unique_publishers: int
    avg_price: float
    median_price: float
    total_reviews: int

class GameDetail(BaseModel):
    game_id: int
    Appid: int
    Name: str
    Type: str
    ReleaseDate: str
    release_year: int
    Developers: str
    Publishers: str
    Description: str
    short_description: str
    price: float
    price_display: str
    Thumbnail: str
    tag_list: List[str]
    ReviewScore: int
    PositiveReview: int
    NegativeReview: int
    TotalReviews: int
    ReviewRatio: float
    OsRequirement: List[str]
    MemoryRequirement: float
    CpuRequirement: str
    Rank: int

class GameListResponse(BaseModel):
    items: List[GameDetail]
    page: int
    limit: int
    total: int
    total_pages: int

class TagCount(BaseModel):
    tag: str
    count: int

class DeveloperCount(BaseModel):
    developer: str
    count: int

class PublisherCount(BaseModel):
    publisher: str
    count: int

class RecommendationResponse(GameDetail):
    similarity_score: float
    shared_tags: List[str]
    explanation: str

class RecommendationByNameResponse(BaseModel):
    selected_game: Optional[GameDetail] = None
    recommendations: List[RecommendationResponse]

class AutocompleteResponse(BaseModel):
    game_id: int
    Name: str
    Thumbnail: str
    price_display: str
