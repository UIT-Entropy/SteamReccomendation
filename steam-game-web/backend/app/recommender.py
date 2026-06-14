import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.data_loader import serialize_game

class GameRecommender:
    def __init__(self):
        self.df = None
        self.vectorizer = None
        self.tfidf_matrix = None

    def fit(self, df):
        """
        Fits the TF-IDF Vectorizer on the dataset.
        Builds the recommendation text based on:
        - Name repeated 2 times
        - Tags repeated 4 times
        - Developers repeated 2 times
        - Publishers repeated 2 times
        - Description once
        - Type once
        """
        self.df = df.copy()
        
        # Use lowercase 'tags' or 'Tags' based on actual columns
        tags_col = 'tags' if 'tags' in self.df.columns else ('Tags' if 'Tags' in self.df.columns else '')
        
        def make_recommend_text(row):
            name = str(row['Name'])
            
            # Clean comma-separated strings to space-separated words
            tags_clean = str(row[tags_col]).replace(',', ' ') if tags_col and pd.notna(row[tags_col]) else ""
            devs = str(row['Developers']).replace(',', ' ')
            pubs = str(row['Publishers']).replace(',', ' ')
            desc = str(row['Description'])
            gtype = str(row['Type'])
            
            text = (
                name + " " + name + " " +
                tags_clean + " " + tags_clean + " " + tags_clean + " " + tags_clean + " " +
                devs + " " + devs + " " +
                pubs + " " + pubs + " " +
                desc + " " +
                gtype
            )
            return text
            
        print("Building recommendation text for TF-IDF...")
        self.df['recommend_text'] = self.df.apply(make_recommend_text, axis=1)
        
        print("Fitting TF-IDF Vectorizer...")
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=30000,
            ngram_range=(1, 2),
            min_df=2
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['recommend_text'])
        print(f"TF-IDF fit complete. Vocabulary size: {len(self.vectorizer.vocabulary_)}")

    def get_shared_tags(self, idx_a, idx_b):
        """
        Retrieves the intersection of tags between two games.
        """
        tags_a = set(self.df.loc[idx_a, 'tag_list'])
        tags_b = set(self.df.loc[idx_b, 'tag_list'])
        return list(tags_a.intersection(tags_b))

    def get_explanation(self, idx_a, idx_b, shared_tags, score):
        """
        Generates a human-friendly string explaining the similarity.
        """
        # Check shared developer
        devs_a = set([d.strip().lower() for d in str(self.df.loc[idx_a, 'Developers']).split(',') if d.strip() and d.strip() != 'N/A'])
        devs_b = set([d.strip().lower() for d in str(self.df.loc[idx_b, 'Developers']).split(',') if d.strip() and d.strip() != 'N/A'])
        shared_devs = devs_a.intersection(devs_b)
        
        # Check shared publisher
        pubs_a = set([p.strip().lower() for p in str(self.df.loc[idx_a, 'Publishers']).split(',') if p.strip() and p.strip() != 'N/A'])
        pubs_b = set([p.strip().lower() for p in str(self.df.loc[idx_b, 'Publishers']).split(',') if p.strip() and p.strip() != 'N/A'])
        shared_pubs = pubs_a.intersection(pubs_b)
        
        if shared_devs:
            dev_display = next(iter(shared_devs))
            # Restore original case
            for d in str(self.df.loc[idx_a, 'Developers']).split(','):
                if d.strip().lower() == dev_display:
                    dev_display = d.strip()
                    break
            return f"Similar because both games share developer: {dev_display}"
            
        if shared_pubs:
            pub_display = next(iter(shared_pubs))
            # Restore original case
            for p in str(self.df.loc[idx_a, 'Publishers']).split(','):
                if p.strip().lower() == pub_display:
                    pub_display = p.strip()
                    break
            return f"Similar because both games share publisher: {pub_display}"
            
        if shared_tags:
            return f"Similar because both games share tags: {', '.join(shared_tags[:3])}"
            
        return "Similar because they share developer/publisher/content terms"

    def recommend_by_id(self, game_id, top_n=12):
        """
        Generates recommendations for a given game ID by calculating cosine similarity on the fly.
        """
        matches = self.df[self.df['game_id'] == game_id]
        if matches.empty:
            return []
            
        # Get dataframe row index
        idx = matches.index[0]
        
        # Compute cosine similarity between the query item and all database items
        query_tfidf = self.tfidf_matrix[idx]
        similarities = cosine_similarity(query_tfidf, self.tfidf_matrix).flatten()
        
        # Get indices sorted descending by similarity score
        sorted_indices = similarities.argsort()[::-1]
        
        recommendations = []
        for s_idx in sorted_indices:
            # Exclude the selected game itself
            if s_idx == idx:
                continue
                
            score = float(similarities[s_idx])
            shared_tags = self.get_shared_tags(idx, s_idx)
            explanation = self.get_explanation(idx, s_idx, shared_tags, score)
            
            # Build clean dict representation
            rec_game = serialize_game(self.df.loc[s_idx])
            rec_game['similarity_score'] = round(score, 4)
            rec_game['shared_tags'] = shared_tags
            rec_game['explanation'] = explanation
            
            recommendations.append(rec_game)
            if len(recommendations) >= top_n:
                break
                
        return recommendations

    def recommend_by_name(self, name, top_n=12):
        """
        Finds closest game by name (case-insensitive) and gets recommendations.
        Returns a tuple: (selected_game_dict, list_of_recommendation_dicts)
        """
        # Try exact case-insensitive match
        matches = self.df[self.df['Name'].str.lower() == name.lower()]
        
        # Try substring match if no exact match
        if matches.empty:
            matches = self.df[self.df['Name'].str.lower().str.contains(name.lower(), na=False)]
            
        if matches.empty:
            return None, []
            
        # Use top ranked matching game
        matches = matches.sort_values(by='Rank')
        matched_row = matches.iloc[0]
        game_id = int(matched_row['game_id'])
        
        recs = self.recommend_by_id(game_id, top_n)
        return serialize_game(matched_row), recs

    def search_names_autocomplete(self, query, limit=10):
        """
        Searches names for autocomplete suggestion (for Recommendation search bar).
        """
        if not query:
            return []
        matches = self.df[self.df['Name'].str.lower().str.contains(query.lower(), na=False)]
        # Sort by Rank to show most popular matches first
        matches = matches.sort_values(by='Rank')
        
        results = []
        for _, row in matches.head(limit).iterrows():
            results.append({
                "game_id": int(row["game_id"]),
                "Name": str(row["Name"]),
                "Thumbnail": str(row["Thumbnail"]),
                "price_display": str(row["price_display"])
            })
        return results
