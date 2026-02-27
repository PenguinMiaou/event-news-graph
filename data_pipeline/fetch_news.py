import os
import feedparser
import json
import urllib.parse

def fetch_google_news(topic, language="en", time_range=""):
    query = topic
    if time_range:
        query += f" when:{time_range}"
        
    topic_encoded = urllib.parse.quote(query)
    
    if language == "zh":
        rss_url = f"https://news.google.com/rss/search?q={topic_encoded}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
    else:
        rss_url = f"https://news.google.com/rss/search?q={topic_encoded}&hl=en-US&gl=US&ceid=US:en"
    
    feed = feedparser.parse(rss_url)
    
    articles = []
    for entry in feed.entries:
        article = {
            "title": entry.title,
            "link": entry.link,
            "published": entry.published if hasattr(entry, 'published') else "",
            "source": entry.source.title if hasattr(entry, 'source') else "Google News"
        }
        articles.append(article)
    return articles

def fetch_yahoo_news(topic, language="en"):
    topic_encoded = urllib.parse.quote(topic)
    rss_url = f"https://news.search.yahoo.com/rss?p={topic_encoded}"
    
    # Optional language suffix for Yahoo
    if language == "zh":
        rss_url += "&vl=lang_zh"
        
    feed = feedparser.parse(rss_url)
    
    articles = []
    for entry in feed.entries:
        article = {
            "title": entry.title,
            "link": entry.link,
            "published": entry.published if hasattr(entry, 'published') else "",
            "source": entry.source.title if hasattr(entry, 'source') else "Yahoo News"
        }
        articles.append(article)
    return articles

def fetch_combined_news(topic, max_articles=10, language="en", time_range=""):
    print(f"Fetching news for topic: '{topic}' from multiple sources...")
    
    google_articles = fetch_google_news(topic, language, time_range)
    yahoo_articles = fetch_yahoo_news(topic, language)
    
    # Interleave to ensure diverse representation and skip exact duplicates
    combined = []
    seen_titles = set()
    
    max_len = max(len(google_articles), len(yahoo_articles))
    for i in range(max_len):
        if i < len(google_articles):
            title = google_articles[i]["title"]
            if title not in seen_titles:
                combined.append(google_articles[i])
                seen_titles.add(title)
        
        if i < len(yahoo_articles):
            title = yahoo_articles[i]["title"]
            if title not in seen_titles:
                combined.append(yahoo_articles[i])
                seen_titles.add(title)
                
        if len(combined) >= max_articles:
            break
            
    final_articles = combined[:max_articles]
    print(f"Fetched {len(final_articles)} articles combined from Google & Yahoo.")
    return final_articles

if __name__ == "__main__":
    topic = "SpaceX Mars"
    articles = fetch_combined_news(topic, 5, language="en", time_range="7d")
    print(json.dumps(articles, indent=2))
