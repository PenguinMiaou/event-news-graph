import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import NetworkView from './components/NetworkView';
import TimelineView from './components/TimelineView';
import NodeDetailPanel from './components/NodeDetailPanel';
import SettingsPanel from './components/SettingsPanel';
import { mockGraph } from './data/mockGraph';

function GraphController({ settings, actView, setActView, forkedNodes, setForkedNodes, setIsSettingsOpen }) {
  const { topicName, forkId } = useParams();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [savedTopics, setSavedTopics] = useState(() => {
    const saved = localStorage.getItem('eventNewsTopics');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('eventNewsTopics', JSON.stringify(savedTopics));
  }, [savedTopics]);

  useEffect(() => {
    // Determine the query based on route
    let query = topicName;
    if (forkId) {
      query = forkId; // For this MVP, searching a fork just searches that node's name
    }

    if (query) {
      handleSearch(query);
    }
  }, [topicName, forkId]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (node) setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedNode(null), 400); // Wait for transition fade
  };

  const handleSearch = async (query) => {
    if (!query) return;

    // 1. Check local cache first
    const existing = savedTopics.find(t => t.topic.toLowerCase() === query.toLowerCase());
    if (existing && existing.data) {
      setGraphData(existing.data);
      // Update timestamp to bubble to top (if not pinned)
      setSavedTopics(prev => {
        const sorted = [...prev];
        const idx = sorted.findIndex(t => t.topic.toLowerCase() === query.toLowerCase());
        if (idx !== -1) {
          sorted[idx] = { ...sorted[idx], timestamp: Date.now() };
        }
        return sorted;
      });
      return;
    }

    if (!settings.apiKey) {
      alert("Please configure your Gemini API Key in the settings first.");
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    closePanel();
    try {
      const url = `http://127.0.0.1:5000/api/search?q=${encodeURIComponent(query)}&depth=${settings.depth}&key=${encodeURIComponent(settings.apiKey)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);

        // Save to cache
        setSavedTopics(prev => {
          const newHistory = [...prev];
          const idx = newHistory.findIndex(t => t.topic.toLowerCase() === query.toLowerCase());
          if (idx >= 0) {
            newHistory[idx] = { ...newHistory[idx], data, timestamp: Date.now() };
          } else {
            newHistory.push({ topic: query, data, isPinned: false, timestamp: Date.now() });
          }
          return newHistory;
        });
      } else {
        const errData = await res.json();
        alert(`API Error: ${errData.error || res.statusText}`);
      }
    } catch (err) {
      alert("Error talking to API server. Is python flask running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTopic = (e, topicName) => {
    e.stopPropagation();
    setSavedTopics(prev => prev.filter(t => t.topic !== topicName));
    if (topicName === topicName) {
      navigate('/');
    }
  };

  const handleTogglePin = (e, topicName) => {
    e.stopPropagation();
    setSavedTopics(prev => {
      return prev.map(t => t.topic === topicName ? { ...t, isPinned: !t.isPinned } : t);
    });
  };

  const handleSearchSubmit = (query) => {
    navigate(`/topic/${encodeURIComponent(query)}`);
  };

  const handleFork = (nodeTitle) => {
    if (!forkedNodes.includes(nodeTitle)) {
      setForkedNodes([...forkedNodes, nodeTitle]);
    }
    closePanel();
    navigate(`/fork/${encodeURIComponent(nodeTitle)}`);
  };

  return (
    <>
      <Sidebar
        actView={actView}
        setActView={setActView}
        savedTopics={savedTopics}
        onSearch={handleSearchSubmit}
        isLoading={isLoading}
        forkedNodes={forkedNodes}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onDeleteTopic={handleDeleteTopic}
        onTogglePin={handleTogglePin}
      />

      <main className="main-content">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="scanner"></div>
            <p>Scanning global news sources & extracting Knowledge Graph...</p>
          </div>
        ) : !graphData ? (
          <div className="welcome-screen">
            <h1>Welcome to NextGen Graph</h1>
            <p>Enter a topic in the sidebar to generate a structural knowledge graph from live news feeds.</p>
          </div>
        ) : actView === 'network' ? (
          <NetworkView
            data={graphData}
            selectedNode={selectedNode}
            onNodeClick={handleNodeClick}
          />
        ) : (
          <TimelineView
            data={graphData}
            selectedNode={selectedNode}
            onNodeClick={handleNodeClick}
          />
        )}

        <NodeDetailPanel
          node={selectedNode}
          isOpen={isPanelOpen}
          onClose={closePanel}
          onFork={handleFork}
        />
      </main>
    </>
  );
}

function App() {
  const [actView, setActView] = useState('network');
  const [forkedNodes, setForkedNodes] = useState([]);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: localStorage.getItem('geminiApiKey') || '',
    depth: parseInt(localStorage.getItem('geminiDepth') || '3', 10)
  });

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('geminiApiKey', newSettings.apiKey);
    localStorage.setItem('geminiDepth', newSettings.depth);
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<GraphController settings={settings} actView={actView} setActView={setActView} forkedNodes={forkedNodes} setForkedNodes={setForkedNodes} setIsSettingsOpen={setIsSettingsOpen} />} />
        <Route path="/topic/:topicName" element={<GraphController settings={settings} actView={actView} setActView={setActView} forkedNodes={forkedNodes} setForkedNodes={setForkedNodes} setIsSettingsOpen={setIsSettingsOpen} />} />
        <Route path="/fork/:forkId" element={<GraphController settings={settings} actView={actView} setActView={setActView} forkedNodes={forkedNodes} setForkedNodes={setForkedNodes} setIsSettingsOpen={setIsSettingsOpen} />} />
      </Routes>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={settings}
      />
    </div>
  );
}

export default App;
