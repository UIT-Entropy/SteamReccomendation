const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Helper to perform HTTP GET requests and return JSON
 */
async function fetchJson(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  // Clean and add search params
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      url.searchParams.append(key, params[key]);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorMsg || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    throw error;
  }
}

export async function getStats() {
  return fetchJson("/stats");
}

export async function getGames(params = {}) {
  return fetchJson("/games", params);
}

export async function getGame(id) {
  return fetchJson(`/games/${id}`);
}

export async function getTags() {
  return fetchJson("/tags");
}

export async function getDevelopers() {
  return fetchJson("/developers");
}

export async function getPublishers() {
  return fetchJson("/publishers");
}

export async function getRecommendations(id, topN = 12) {
  return fetchJson(`/recommend/${id}`, { top_n: topN });
}

export async function recommendByName(name, topN = 12) {
  return fetchJson("/recommend-by-name", { name, top_n: topN });
}

export async function getAutocomplete(q, limit = 10) {
  return fetchJson("/autocomplete", { q, limit });
}
