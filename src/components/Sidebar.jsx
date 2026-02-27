import React, { useState } from 'react';
import { GitCommit, Clock, Split, Search, GitFork, Settings as SettingsIcon, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ actView, setActView, savedTopics, onSearch, isLoading, forkedNodes, onOpenSettings, onDeleteTopic, onTogglePin }) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    // Sort topics: Pinned first, then by timestamp descending
    const sortedTopics = [...(savedTopics || [])].sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            return b.timestamp - a.timestamp;
        }
        return a.isPinned ? -1 : 1;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) onSearch(query);
    };

    return (
        <div className="sidebar">
            <div className="brand">
                <div className="brand-icon"></div>
                <h1>NextGen Graph</h1>
            </div>

            <div className="nav-section">
                <form onSubmit={handleSubmit} className="search-box">
                    <input
                        type="text"
                        placeholder="Search Topic (e.g. OpenAI)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !query.trim()}>
                        {isLoading ? <span className="spinner"></span> : <Search size={16} />}
                    </button>
                </form>
            </div>

            <div className="nav-section">
                <div className="nav-label">Views</div>
                <div
                    className={`nav-item ${actView === 'network' ? 'active' : ''}`}
                    onClick={() => setActView('network')}
                >
                    <Split size={18} /> Network Map
                </div>
                <div
                    className={`nav-item ${actView === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActView('timeline')}
                >
                    <Clock size={18} /> Timeline
                </div>
            </div>

            <div className="nav-section">
                <div className="nav-label">Topic History</div>
                {sortedTopics.length === 0 ? (
                    <div className="empty-text">No history yet.</div>
                ) : (
                    sortedTopics.map(t => (
                        <div key={t.topic} className={`nav-item branch-item ${t.isPinned ? 'pinned' : ''}`} onClick={() => navigate(`/topic/${encodeURIComponent(t.topic)}`)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                                <GitCommit size={16} style={{ flexShrink: 0 }} />
                                <span title={t.topic} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.topic}</span>
                            </div>
                            <div className="topic-actions" style={{ display: 'flex', gap: '6px', opacity: t.isPinned ? 1 : '' }}>
                                <Star
                                    size={14}
                                    style={{ cursor: 'pointer', color: t.isPinned ? '#fbbf24' : 'var(--text-muted)' }}
                                    onClick={(e) => onTogglePin(e, t.topic)}
                                    fill={t.isPinned ? "#fbbf24" : "none"}
                                />
                                <Trash2
                                    size={14}
                                    style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                                    onClick={(e) => onDeleteTopic(e, t.topic)}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="nav-section">
                <div className="nav-label">My Forks</div>
                {forkedNodes.length === 0 ? (
                    <div className="empty-text">No forks yet. Read nodes and branch out!</div>
                ) : (
                    forkedNodes.map((fn, idx) => (
                        <div key={idx} className="nav-item" onClick={() => navigate(`/fork/${encodeURIComponent(fn)}`)}>
                            <GitFork size={16} /> <span title={fn}>{fn.length > 20 ? fn.substring(0, 20) + '...' : fn}</span>
                        </div>
                    ))
                )}
            </div>
            <div className="nav-section" style={{ marginTop: 'auto', marginBottom: 0 }}>
                <div
                    className="nav-item"
                    onClick={onOpenSettings}
                >
                    <SettingsIcon size={18} /> Settings
                </div>
            </div>
        </div >
    );
}
