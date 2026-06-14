import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional
from collections import Counter

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.data_loader import load_games, get_stats, serialize_game
from app.recommender import GameRecommender
from app.utils import get_logger, resolve_data_path
from app import schemas

logger = get_logger("steam_games_api")

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = resolve_data_path("data", "processed", "SteamGames_cleaned.csv")

# Global instances loaded at startup
df = None
recommender = None
global_stats = None
precomputed_tags = []
precomputed_devs = []
precomputed_pubs = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    global df, recommender, global_stats
    global precomputed_tags, precomputed_devs, precomputed_pubs
    
    logger.info("Starting up Steam Games API...")
    
    # Use a local variable to avoid UnboundLocalError
    target_csv_path = CSV_PATH
    logger.info(f"Checking dataset path: {target_csv_path}")
    
    if not target_csv_path.exists():
        logger.error(f"Dataset file not found at {target_csv_path}!")
        raise FileNotFoundError(f"Could not locate SteamGames_cleaned.csv at {target_csv_path}")
            
    logger.info("Loading games dataset from CSV...")
    df = load_games(target_csv_path)
    logger.info(f"Loaded {len(df)} games successfully.")
    
    logger.info("Calculating dataset statistics...")
    global_stats = get_stats(df)
    logger.info(f"Stats calculated: {global_stats}")
    
    logger.info("Precomputing tags, developers, and publishers dropdown counts...")
    
    # 1. Tags
    all_tags = []
    for tags in df['tag_list']:
        all_tags.extend(tags)
    tag_counts = Counter(all_tags)
    precomputed_tags = [{"tag": tag, "count": count} for tag, count in tag_counts.most_common()]
    
    # 2. Developers
    all_devs = []
    for dev_str in df['Developers']:
        if dev_str and dev_str != 'N/A':
            all_devs.extend([d.strip() for d in dev_str.split(',') if d.strip()])
    dev_counts = Counter(all_devs)
    precomputed_devs = [{"developer": dev, "count": count} for dev, count in dev_counts.most_common(200)]
    
    # 3. Publishers
    all_pubs = []
    for pub_str in df['Publishers']:
        if pub_str and pub_str != 'N/A':
            all_pubs.extend([p.strip() for p in pub_str.split(',') if p.strip()])
    pub_counts = Counter(all_pubs)
    precomputed_pubs = [{"publisher": pub, "count": count} for pub, count in pub_counts.most_common(200)]
    
    logger.info("Initializing and fitting GameRecommender (TF-IDF + Cosine Similarity)...")
    recommender = GameRecommender()
    recommender.fit(df)
    logger.info("GameRecommender fit complete. System is ready!")
    
    yield
    
    logger.info("Shutting down Steam Games API...")

app = FastAPI(
    title="Steam Games Data Explorer API",
    description="Backend service for searching, filtering, and recommending Steam games.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "message": "Steam Games data web app backend is running",
        "total_games": len(df) if df is not None else 0
    }

@app.get("/stats", response_model=schemas.StatResponse)
def get_dashboard_stats():
    if global_stats is None:
        raise HTTPException(status_code=503, detail="Service is starting up, stats not ready yet.")
    return global_stats

@app.get("/games", response_model=schemas.GameListResponse)
def get_games(
    page: int = 1,
    limit: int = 24,
    q: Optional[str] = None,
    tag: Optional[str] = None,
    developer: Optional[str] = None,
    publisher: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    free_only: bool = False,
    sort_by: str = "rank",
    order: str = "asc"
):
    if df is None:
        raise HTTPException(status_code=503, detail="Database not loaded yet.")
        
    filtered_df = df
    
    # 1. Search Query (Name, Description, tags, Developers, Publishers)
    if q:
        q_lower = q.lower()
        tags_col = 'tags' if 'tags' in df.columns else 'Tags'
        mask = (
            filtered_df['Name'].str.lower().str.contains(q_lower, na=False) |
            filtered_df['Description'].str.lower().str.contains(q_lower, na=False) |
            filtered_df[tags_col].str.lower().str.contains(q_lower, na=False) |
            filtered_df['Developers'].str.lower().str.contains(q_lower, na=False) |
            filtered_df['Publishers'].str.lower().str.contains(q_lower, na=False)
        )
        filtered_df = filtered_df[mask]
        
    # 2. Tag filter (match in list of tags)
    if tag:
        tag_lower = tag.lower()
        filtered_df = filtered_df[filtered_df['tag_list'].apply(lambda x: tag_lower in [t.lower() for t in x])]
        
    # 3. Developer filter (contains developer substring)
    if developer:
        dev_lower = developer.lower()
        filtered_df = filtered_df[filtered_df['Developers'].str.lower().str.contains(dev_lower, na=False)]
        
    # 4. Publisher filter (contains publisher substring)
    if publisher:
        pub_lower = publisher.lower()
        filtered_df = filtered_df[filtered_df['Publishers'].str.lower().str.contains(pub_lower, na=False)]
        
    # 5. Price filter
    if free_only:
        filtered_df = filtered_df[filtered_df['price'] == 0]
    else:
        if min_price is not None:
            filtered_df = filtered_df[filtered_df['price'] >= min_price]
        if max_price is not None:
            filtered_df = filtered_df[filtered_df['price'] <= max_price]
            
    # 6. Sorting
    sort_mapping = {
        "rank": "Rank",
        "name": "Name",
        "price": "price",
        "release_date": "ReleaseDate_parsed",
        "total_reviews": "TotalReviews",
        "review_ratio": "ReviewRatio"
    }
    
    col = sort_mapping.get(sort_by.lower(), "Rank")
    ascending = (order.lower() == "asc")
    
    # Sort values. For ReleaseDate_parsed and numerical columns, handle sorting properly.
    if col in filtered_df.columns:
        filtered_df = filtered_df.sort_values(by=col, ascending=ascending)
    
    # Pagination
    total = len(filtered_df)
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    paginated_slice = filtered_df.iloc[start_idx:end_idx]
    
    items = [serialize_game(row) for _, row in paginated_slice.iterrows()]
    
    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    }

@app.get("/games/{game_id}", response_model=schemas.GameDetail)
def get_game_detail(game_id: int):
    if df is None:
        raise HTTPException(status_code=503, detail="Database not loaded yet.")
        
    matches = df[df['game_id'] == game_id]
    if matches.empty:
        raise HTTPException(status_code=404, detail="Game not found")
        
    return serialize_game(matches.iloc[0])

@app.get("/tags", response_model=List[schemas.TagCount])
def get_top_tags():
    return precomputed_tags

@app.get("/developers", response_model=List[schemas.DeveloperCount])
def get_top_developers():
    return precomputed_devs

@app.get("/publishers", response_model=List[schemas.PublisherCount])
def get_top_publishers():
    return precomputed_pubs

@app.get("/recommend/{game_id}", response_model=List[schemas.RecommendationResponse])
def get_game_recommendations(game_id: int, top_n: int = 12):
    if recommender is None:
        raise HTTPException(status_code=503, detail="Recommender model is training/loading.")
        
    # Check if game exists
    matches = df[df['game_id'] == game_id]
    if matches.empty:
        raise HTTPException(status_code=404, detail="Game not found")
        
    recs = recommender.recommend_by_id(game_id, top_n=top_n)
    return recs

@app.get("/recommend-by-name", response_model=schemas.RecommendationByNameResponse)
def get_recommendations_by_name(name: str, top_n: int = 12):
    if recommender is None:
        raise HTTPException(status_code=503, detail="Recommender model is training/loading.")
        
    selected, recs = recommender.recommend_by_name(name, top_n=top_n)
    if selected is None:
        return {"selected_game": None, "recommendations": []}
        
    return {"selected_game": selected, "recommendations": recs}

@app.get("/autocomplete", response_model=List[schemas.AutocompleteResponse])
def get_autocomplete(q: str = "", limit: int = 10):
    if recommender is None:
        return []
    return recommender.search_names_autocomplete(q, limit=limit)
