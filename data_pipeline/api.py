from flask import Flask, request, jsonify
from flask_cors import CORS
from fetch_news import fetch_google_news
from extract_graph import extract_graph_from_articles
from database import init_db, get_cached_graph, save_graph_to_cache
import json

app = Flask(__name__)
CORS(app) # Allow React frontend to fetch data

@app.route('/api/search', methods=['GET'])
def search_topic():
    topic = request.args.get('q', 'SpaceX')
    api_key = request.args.get('key', '')
    depth_str = request.args.get('depth', '3')
    
    try:
        depth = int(depth_str)
        
        # Depth mapping: 1=Main Event, 2=Main+Sub, 3=Main+Sub+Grandchild
        article_counts = {1: 5, 2: 12, 3: 20}
        max_articles = article_counts.get(depth, 12)
        
        # Check DB Cache
        cached_json = get_cached_graph(topic, depth)
        if cached_json:
            print(f"[{topic} | Depth {depth}] Found in SQLite Cache. Returning instantly.")
            graph_data = json.loads(cached_json)
            return jsonify(graph_data)
            
        print(f"[{topic} | Depth {depth}] Not in cache. Passing to Gemini.")
        
        articles = fetch_google_news(topic, max_articles=max_articles)
        if not articles:
            return jsonify({"error": "No articles found"}), 404
        
        raw_output = extract_graph_from_articles(articles, topic, api_key=api_key, depth=depth)
        
        clean_json = raw_output.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()
        
        # Save to DB
        save_graph_to_cache(topic, depth, clean_json)
        
        graph_data = json.loads(clean_json)
        return jsonify(graph_data)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Initializing SQLite Database...")
    init_db()
    print("Starting NextGen Graph API Server on port 5000...")
    app.run(port=5000, debug=True)
