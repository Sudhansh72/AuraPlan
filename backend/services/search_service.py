import httpx
import json
import os
import config
from schemas import VendorMatch, ResourceImage
import logging
from duckduckgo_search import DDGS
import asyncio

logger = logging.getLogger(__name__)

# Quota management
def _load_usage():
    if not os.path.exists(config.USAGE_STATS_FILE):
        return {"tavily": 0, "brave": 0, "firecrawl": 0, "ddg": 0}
    try:
        with open(config.USAGE_STATS_FILE, "r") as f:
            return json.load(f)
    except:
        return {"tavily": 0, "brave": 0, "firecrawl": 0, "ddg": 0}

def _save_usage(stats):
    try:
        with open(config.USAGE_STATS_FILE, "w") as f:
            json.dump(stats, f)
    except Exception as e:
        logger.error(f"Failed to save usage stats: {e}")

def check_and_increment_quota(provider: str) -> bool:
    stats = _load_usage()
    limit = 0
    if provider == "tavily": limit = config.MAX_TAVILY_QUOTA
    elif provider == "brave": limit = config.MAX_BRAVE_QUOTA
    elif provider == "firecrawl": limit = config.MAX_FIRECRAWL_QUOTA
    elif provider == "ddg": limit = config.MAX_DDG_QUOTA
    
    if stats.get(provider, 0) >= limit:
        logger.warning(f"Quota exceeded for {provider}")
        return False
        
    stats[provider] = stats.get(provider, 0) + 1
    _save_usage(stats)
    return True

def grade_sentiment(text: str) -> str:
    if not text:
        return "C"
    text_lower = text.lower()
    positive_keywords = ["excellent", "professional", "reliable", "beautiful", "responsive", "friendly", "clean", "organized", "recommended", "great", "amazing", "perfect", "fantastic", "wonderful"]
    negative_keywords = ["late", "rude", "expensive", "unresponsive", "poor", "dirty", "cancelled", "disappointing", "bad", "unreliable", "terrible", "awful", "horrible"]
    pos_score = sum(1 for word in positive_keywords if word in text_lower)
    neg_score = sum(1 for word in negative_keywords if word in text_lower)
    if pos_score > 0 and neg_score == 0: return "A" if pos_score >= 2 else "B"
    elif neg_score > 0 and pos_score == 0: return "F" if neg_score >= 2 else "D"
    elif pos_score > neg_score: return "B"
    elif neg_score > pos_score: return "D"
    else: return "C"

def _get_mock_vendors(location: str | None = None) -> list[VendorMatch]:
    loc_str = location or "your area"
    return [
        VendorMatch(name="Local Boutique Venue Concept", type="Venue", location=loc_str, description="A conceptual versatile space.", estimated_price_range="$$ - $$$", review_snippet="Beautiful conceptual space.", sentiment_grade="A"),
        VendorMatch(name="Premium Catering Option Concept", type="Catering", location=loc_str, description="Conceptual culinary team.", estimated_price_range="$$$", review_snippet="The food concept was amazing.", sentiment_grade="A")
    ]

async def search_vendors(query: str, location: str | None = None) -> tuple[list[VendorMatch], list[ResourceImage], bool]:
    if not config.ENABLE_VENDOR_SEARCH:
        return _get_mock_vendors(location), [], False

    # Provider Selection with Quota Protection
    provider = config.SEARCH_PROVIDER
    
    # Try DuckDuckGo if designated or as a fallback because it's free
    if provider == "ddg" or (provider != "mock" and not check_and_increment_quota(provider)):
        if provider != "ddg":
            logger.info(f"Switching to DDG due to quota or config.")
        
        if check_and_increment_quota("ddg"):
            try:
                search_query = f"{query} near {location}" if location else query
                with DDGS() as ddgs:
                    results = list(ddgs.text(search_query, max_results=5))
                    vendors = []
                    for i, r in enumerate(results):
                        vendors.append(VendorMatch(
                            name=r.get("title", f"Vendor Option {i+1}"),
                            type="Event Service",
                            location=location or "Local",
                            description=r.get("body", "")[:150],
                            estimated_price_range="Contact for pricing",
                            review_snippet=r.get("body", "")[:100],
                            sentiment_grade=grade_sentiment(r.get("body", "")),
                            source_url=r.get("href")
                        ))
                    return vendors, [], True
            except Exception as e:
                logger.error(f"DDG search failed: {e}")
                return _get_mock_vendors(location), [], False

    if provider == "tavily" and config.TAVILY_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=config.SEARCH_TIMEOUT_SECONDS) as client:
                search_query = f"{query} near {location}" if location else query
                response = await client.post("https://api.tavily.com/search", json={"api_key": config.TAVILY_API_KEY, "query": search_query, "search_depth": "basic", "include_images": True, "max_results": 5})
                response.raise_for_status()
                data = response.json()
                vendors, images = [], []
                for img_url in data.get("images", [])[:3]:
                    if isinstance(img_url, str) and img_url.startswith("http"):
                        images.append(ResourceImage(title="Vendor Inspiration", image_url=img_url))
                for i, result in enumerate(data.get("results", [])):
                    snippet = result.get("content", "")
                    # Try to pick an image if available for this vendor
                    vendor_image = images[i].image_url if i < len(images) else None
                    vendors.append(VendorMatch(
                        name=result.get("title", f"Vendor Option {i+1}"), 
                        type="Event Service", 
                        location=location or "Local", 
                        description=snippet[:150], 
                        estimated_price_range="Contact for pricing", 
                        review_snippet=snippet[:100], 
                        sentiment_grade=grade_sentiment(snippet), 
                        source_url=result.get("url"),
                        image_url=vendor_image
                    ))
                return vendors, images, True
        except Exception as e:
            logger.error(f"Tavily search failed: {e}")

    return _get_mock_vendors(location), [], False

async def scrape_with_firecrawl(url: str) -> str:
    if not config.FIRECRAWL_API_KEY or not check_and_increment_quota("firecrawl"):
        return ""
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                "https://api.firecrawl.dev/v1/scrape",
                headers={"Authorization": f"Bearer {config.FIRECRAWL_API_KEY}", "Content-Type": "application/json"},
                json={"url": url, "formats": ["markdown"]}
            )
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("markdown", "")
    except Exception as e:
        logger.error(f"Firecrawl scrape failed: {e}")
        return ""
