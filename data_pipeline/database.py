import sqlite3
import json
import time

DB_PATH = 'event_news.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at REAL
        )
    ''')
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS graphs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_id INTEGER NOT NULL,
            depth INTEGER NOT NULL,
            raw_json TEXT NOT NULL,
            created_at REAL,
            FOREIGN KEY (topic_id) REFERENCES topics (id),
            UNIQUE(topic_id, depth)
        )
    ''')
    
    conn.commit()
    conn.close()

def get_cached_graph(topic_name, depth):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''
        SELECT g.raw_json
        FROM graphs g
        JOIN topics t ON g.topic_id = t.id
        WHERE t.name = ? COLLATE NOCASE AND g.depth = ?
    ''', (topic_name, depth))
    
    row = c.fetchone()
    conn.close()
    
    if row:
        return row[0]
    return None

def save_graph_to_cache(topic_name, depth, raw_json):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Insert or ignore topic
    c.execute('INSERT OR IGNORE INTO topics (name, created_at) VALUES (?, ?)', (topic_name, time.time()))
    
    # Get topic id
    c.execute('SELECT id FROM topics WHERE name = ? COLLATE NOCASE', (topic_name,))
    topic_id = c.fetchone()[0]
    
    # Insert or replace graph
    c.execute('''
        INSERT OR REPLACE INTO graphs (topic_id, depth, raw_json, created_at)
        VALUES (?, ?, ?, ?)
    ''', (topic_id, depth, raw_json, time.time()))
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized.")
