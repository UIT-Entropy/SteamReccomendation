import pandas as pd
import numpy as np
from datetime import datetime
import json

def parse_tags(value):
    """
    Parse a comma-separated tag string into a clean list of tags.
    """
    if pd.isna(value) or not isinstance(value, str):
        return []
    # Strip whitespace and normalize to title case or lowercase.
    # In the CSV tags are comma-separated and lowercase. We keep them lowercase.
    return [t.strip().lower() for t in value.split(',') if t.strip()]

def format_price(price_val):
    """
    Format numeric price into a display string.
    """
    try:
        val = float(price_val)
        if val == 0.0:
            return "Free"
        return f"${val:.2f}"
    except (ValueError, TypeError):
        return "Free"

def prepare_games(df):
    """
    Cleans and prepares the Steam games dataframe:
    - Fills NaNs and converts columns to appropriate types.
    - Adds review totals and ratios.
    - Generates user-friendly display columns.
    """
    # Create copy to avoid SettingWithCopyWarning
    df = df.copy()
    
    # Internal unique ID
    df['game_id'] = df.index
    
    # Ensure Name and Description are strings
    df['Name'] = df['Name'].fillna('Unknown Game').astype(str)
    df['Description'] = df['Description'].fillna('').astype(str)
    df['Type'] = df['Type'].fillna('game').astype(str)
    df['Developers'] = df['Developers'].fillna('N/A').astype(str)
    df['Publishers'] = df['Publishers'].fillna('N/A').astype(str)
    df['Thumbnail'] = df['Thumbnail'].fillna('').astype(str)
    
    # Tags parsing
    tags_col = 'tags' if 'tags' in df.columns else 'Tags'
    df['tag_list'] = df[tags_col].apply(parse_tags)
    
    # Parse release date
    df['ReleaseDate_parsed'] = pd.to_datetime(df['ReleaseDate'], errors='coerce')
    df['release_year'] = df['ReleaseDate_parsed'].dt.year.fillna(0).astype(int)
    
    # Price
    df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0.0)
    df['price_display'] = df['price'].apply(format_price)
    
    # Reviews
    df['PositiveReview'] = pd.to_numeric(df['PositiveReview'], errors='coerce').fillna(0).astype(int)
    df['NegativeReview'] = pd.to_numeric(df['NegativeReview'], errors='coerce').fillna(0).astype(int)
    df['ReviewScore'] = pd.to_numeric(df['ReviewScore'], errors='coerce').fillna(0).astype(int)
    
    df['TotalReviews'] = df['PositiveReview'] + df['NegativeReview']
    df['ReviewRatio'] = df.apply(
        lambda r: float(r['PositiveReview']) / r['TotalReviews'] if r['TotalReviews'] > 0 else 0.0,
        axis=1
    )
    
    # Requirements
    df['OsRequirement'] = df['OsRequirement'].fillna('["windows"]').astype(str)
    df['MemoryRequirement'] = pd.to_numeric(df['MemoryRequirement'], errors='coerce').fillna(0.0)
    
    # CPU Requirements (map CSV CPU_req)
    cpu_col = 'CPU_req' if 'CPU_req' in df.columns else ('CpuRequirement' if 'CpuRequirement' in df.columns else None)
    if cpu_col:
        df['CpuRequirement'] = df[cpu_col].fillna("N/A").astype(str)
    else:
        df['CpuRequirement'] = "N/A"
        
    df['Rank'] = pd.to_numeric(df['Rank'], errors='coerce').fillna(99999).astype(int)
    
    # Short description
    df['short_description'] = df['Description'].apply(
        lambda x: x[:180] + '...' if len(x) > 180 else x
    )
    
    return df

def load_games(csv_path):
    """
    Loads raw CSV and returns prepared DataFrame.
    """
    df = pd.read_csv(csv_path)
    return prepare_games(df)

def serialize_game(row):
    """
    Serializes a DataFrame row (as dict or Series) to a JSON-ready format.
    """
    # Safe list parsing for OsRequirement if it is stored as a stringified list
    os_req = row['OsRequirement']
    if isinstance(os_req, str):
        if os_req.startswith('[') and os_req.endswith(']'):
            try:
                # Replace single quotes with double quotes for JSON parsing
                cleaned_os = os_req.replace("'", '"')
                os_req = json.loads(cleaned_os)
            except Exception:
                os_req = [os_req.strip("[]'\"")]
        else:
            os_req = [os_req]
    elif not isinstance(os_req, list):
        os_req = [str(os_req)]

    return {
        "game_id": int(row["game_id"]),
        "Appid": int(row["Appid"]),
        "Name": str(row["Name"]),
        "Type": str(row["Type"]),
        "ReleaseDate": str(row["ReleaseDate"]) if pd.notna(row["ReleaseDate"]) else "",
        "release_year": int(row["release_year"]),
        "Developers": str(row["Developers"]),
        "Publishers": str(row["Publishers"]),
        "Description": str(row["Description"]),
        "short_description": str(row["short_description"]),
        "price": float(row["price"]),
        "price_display": str(row["price_display"]),
        "Thumbnail": str(row["Thumbnail"]),
        "tag_list": list(row["tag_list"]),
        "ReviewScore": int(row["ReviewScore"]),
        "PositiveReview": int(row["PositiveReview"]),
        "NegativeReview": int(row["NegativeReview"]),
        "TotalReviews": int(row["TotalReviews"]),
        "ReviewRatio": round(float(row["ReviewRatio"]), 4),
        "OsRequirement": os_req,
        "MemoryRequirement": float(row["MemoryRequirement"]),
        "CpuRequirement": str(row["CpuRequirement"]),
        "Rank": int(row["Rank"])
    }

def get_stats(df):
    """
    Aggregates database metrics for dashboard statistics.
    """
    total_games = len(df)
    free_games = int((df['price'] == 0).sum())
    paid_games = total_games - free_games
    
    # Extract all unique tags
    all_tags = []
    for tags in df['tag_list']:
        all_tags.extend(tags)
    unique_tags = len(set(all_tags))
    
    # Extract unique developers (comma separated)
    all_devs = set()
    for dev_str in df['Developers']:
        if dev_str and dev_str != 'N/A':
            for d in dev_str.split(','):
                all_devs.add(d.strip())
    unique_developers = len(all_devs)
    
    # Extract unique publishers (comma separated)
    all_pubs = set()
    for pub_str in df['Publishers']:
        if pub_str and pub_str != 'N/A':
            for p in pub_str.split(','):
                all_pubs.add(p.strip())
    unique_publishers = len(all_pubs)
    
    # Average and median price
    avg_price = float(df['price'].mean())
    median_price = float(df['price'].median())
    total_reviews = int(df['TotalReviews'].sum())
    
    return {
        "total_games": total_games,
        "free_games": free_games,
        "paid_games": paid_games,
        "unique_tags": unique_tags,
        "unique_developers": unique_developers,
        "unique_publishers": unique_publishers,
        "avg_price": round(avg_price, 2),
        "median_price": round(median_price, 2),
        "total_reviews": total_reviews
    }
