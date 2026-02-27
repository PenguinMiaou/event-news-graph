import os
import feedparser
import json

def fetch_google_news(topic, max_articles=10):
    print(f"Fetching Google News RSS for topic: '{topic}'...")
    # Safe URL encoding
    topic_encoded = topic.replace(" ", "+")
    rss_url = f"https://news.google.com/rss/search?q={topic_encoded}&hl=en-US&gl=US&ceid=US:en"
    
    feed = feedparser.parse(rss_url)
    
    articles = []
    for entry in feed.entries[:max_articles]:
        article = {
            "title": entry.title,
            "link": entry.link,
            "published": entry.published,
            "source": entry.source.title if hasattr(entry, 'source') else "Unknown Source"
        }
        articles.append(article)
    
    print(f"Fetched {len(articles)} articles.")
    return articles

if __name__ == "__main__":
    topic = "SpaceX Mars"
    articles = fetch_google_news(topic, 5)
    print(json.dumps(articles, indent=2))
