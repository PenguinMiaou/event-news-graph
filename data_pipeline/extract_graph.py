import os
import json
from google import genai
from google.genai import types
from fetch_news import fetch_google_news
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# The client will now be instantiated per request with the user's provided API key

SYSTEM_PROMPT = """You are a highly advanced Information Extraction (IE) system.
Your task is to read a set of news articles on a single overarching topic, and construct a Knowledge Graph in JSON format matching our strict output schema.

The Knowledge Graph consists of:
1. `branches`: The overarching thematic timelines. e.g. "Main Trunk", "Regulatory Action", "Market Impact"
2. `nodes`: The individual pieces of knowledge. Types can be:
   - "event": Something that happened.
   - "entity": A person, organization, place, or concept.
   - "data": A specific metric, claim, or statement.
3. `links`: Directed edges between nodes representing logical relationships. Valid labels:
   - "causes", "triggers", "leads to", "orchestrated by", "part of", "responds to", "demands resignation of", "impacts"

IMPORTANT: You must output ONLY RAW JSON. Do not include markdown code block formatting like ```json ... ```. 
Your output must be immediately parsed by `json.loads()`.

OUTPUT SCHEMA (The exact structure you MUST follow):
{
  "branches": [
    { "id": "b1", "name": "Main Trunk: [Topic Name]" },
    { "id": "b2", "name": "[Sub-Branch Name]" }
  ],
  "nodes": [
    {
      "id": "n1",
      "type": "event|entity|data",
      "title": "Short succinct title",
      "summary": "Detailed summary explaining what this node means and why it's important.",
      "date": "YYYY-MM-DD",
      "sources": [
        { "name": "Source Name from the article", "slant": "neutral|left-leaning|right-leaning", "excerpt": "Relevant quote from the article" }
      ],
      "branchId": "b1"
    }
  ],
  "links": [
    { "source": "n1", "target": "n2", "label": "causes" }
  ]
}
"""

# Dynamic instructions based on depth
def get_depth_instructions(depth):
    if depth == 1:
        return "Level 1 (Core): Extract ONLY the central main event and 1-2 key entities. Max 3-5 nodes. Keep it extremely simple representing only the root of the story."
    elif depth == 2:
        return "Level 2 (Sub-events): Extract the core event and its immediate, directly-triggered sub-events. Max 6-10 nodes. Form a clear 2-tier causal chain."
    else:
        return "Level 3 (Deep Chain): Extract the core event, direct sub-events, and long-tail grandchild effects. Max 12-18 nodes. Build a comprehensive 3-tier web of causes and impacts."


def extract_graph_from_articles(articles, topic, api_key=None, depth=3):
    print(f"Initiating graph extraction via Gemini (Depth: {depth})...")
    
    if not api_key:
        # Fallback to env file if no key provided via request
        api_key = os.getenv("GEMINI_API_KEY")
        
    if not api_key:
        raise ValueError("No Gemini API key provided. Please set it in the Settings panel.")
        
    client = genai.Client(api_key=api_key)
    
    # Format articles into a readable string
    input_text = f"TOPIC: {topic}\n\nARTICLES:\n"
    for i, article in enumerate(articles):
        input_text += f"---\n Article {i+1} Title: {article['title']}\n Source: {article['source']}\n Date: {article['published']}\n"
    
    print("Prompting LLM...")
    
    dynamic_prompt = SYSTEM_PROMPT + "\nInstructions for nodes & links:\n- " + get_depth_instructions(depth)
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=input_text,
        config=types.GenerateContentConfig(
            system_instruction=dynamic_prompt,
            temperature=0.2, # Low temp for structured outputs
        )
    )
    
    return response.text

if __name__ == "__main__":
    topic = "SpaceX Mars"
    articles = fetch_google_news(topic, max_articles=8)
    
    if not articles:
        print("No articles found.")
        exit(1)
        
    try:
        raw_output = extract_graph_from_articles(articles, topic)
        
        # Clean up any potential markdown formatting in case the model ignored instructions
        clean_json = raw_output.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()
        
        graph_data = json.loads(clean_json)
        
        # Target frontend file
        output_file = "../src/data/mockGraph.js"
        print(f"Successfully extracted graph. Writing to {output_file}...")
        
        # Format as a JS module
        js_content = f"export const mockGraph = {json.dumps(graph_data, indent=2)};\n"
        
        # Make sure the src/data directory exists (it should from the MVP)
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(js_content)
        
        print("✨ Done! The frontend data has been updated with real-world news.")
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse LLM output as JSON. Error: {e}")
        print("Raw output was:")
        print(raw_output)
    except Exception as e:
        import traceback
        traceback.print_exc()
