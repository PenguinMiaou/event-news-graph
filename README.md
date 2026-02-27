# NextGen Graph (Event News MVP)

NextGen Graph is a dynamic, LLM-powered knowledge graph application that extracts structural causality and thematic relationships from real-world news feeds in real-time.

## Features

- **Dynamic Extraction**: Uses `google-genai` (Gemini Flash) to parse unstructured Google News RSS feeds into nodes and edges.
- **3-Tier Depth Concept**: Configure the LLM to extract only the core event (Level 1), direct sub-events (Level 2), or full grandchild causal chains (Level 3).
- **Interactive Network Graph**: Custom force-directed physics engine built natively in React.
  - Hover over a node to "Lock" it to your cursor while repelling others for easy reading.
  - Selected nodes pin in place when viewing details.
  - Mouse-anchored trackpad/mouse-wheel zooming.
- **Production Routing Cache**:
  - Top-level Search maps to `react-router` paths (e.g., `/topic/SpaceX`).
  - Frontend `localStorage` instantly restores topic history and pin status.
  - Python backend uses `SQLite` to cache graph generations, eliminating redundant API costs for previously searched scopes.

## Setup

### 1. Backend (Python + Flask)
```bash
cd data_pipeline
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the API server (Port 5000)
python3 api.py
```

### 2. Frontend (Vite + React)
```bash
npm install
npm run dev
```

### 3. Usage
- Open `http://localhost:5173` in your browser.
- Open the bottom-left **Settings** panel to input your **Gemini API Key**.
- Search for a topic (e.g., "OpenAI" or "SpaceX Mars") to generate the knowledge graph. All results will be cached to your local SQLite database for instant future retrieval.

## Architecture Stack
- **Frontend**: Vite, React, React Router, raw SVG/CSS Physics.
- **Backend**: Python 3.10+, Flask, SQLite.
- **Data Layers**: Google News RSS (`feedparser`), Google GenAI SDK.
