import React, { useState } from 'react';
import { GitCommit, Clock, Split, Search, GitFork, Settings as SettingsIcon, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ actView, setActView, savedTopics, onSearch, isLoading, forkedNodes, onOpenSettings, onDeleteTopic, onTogglePin, currentTopicName, currentForkId, onDeleteFork, onToggleForkPin }) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const sortedTopics = [...(savedTopics || [])].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.timestamp - a.timestamp;
    });

    const sortedForks = [...(forkedNodes || [])].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.timestamp - a.timestamp;
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
                {isLoading && currentTopicName && !savedTopics.find(t => t.topic.toLowerCase() === currentTopicName.toLowerCase()) && (
                    <div className="nav-item branch-item active" style={{ opacity: 0.8, cursor: 'default' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                            <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', flexShrink: 0 }}></div>
                            <span title={currentTopicName} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTopicName}</span>
                        </div>
                    </div>
                )}
                {sortedTopics.map(t => {
                    const isCurrent = currentTopicName && currentTopicName.toLowerCase() === t.topic.toLowerCase();
                    return (
                        <div key={t.topic} className={`nav-item branch-item ${t.isPinned ? 'pinned' : ''} ${isCurrent ? 'active' : ''}`} onClick={() => navigate(`/topic/${encodeURIComponent(t.topic)}`)}>
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
                    );
                })}
                {sortedTopics.length === 0 && !(isLoading && currentTopicName) && (
                    <div className="empty-text">No history yet.</div>
                )}
            </div>

            <div className="nav-section">
                <div className="nav-label">My Forks</div>
                {sortedForks.length === 0 ? (
                    <div className="empty-text">No forks yet. Read nodes and branch out!</div>
                ) : (
                    sortedForks.map((f, idx) => {
                        const isCurrent = currentForkId === f.title;
                        return (
                            <div key={idx} className={`nav-item branch-item ${f.isPinned ? 'pinned' : ''} ${isCurrent ? 'active' : ''}`} onClick={() => navigate(`/fork/${encodeURIComponent(f.title)}`)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                                    <GitFork size={16} style={{ flexShrink: 0 }} />
                                    <span title={f.title} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title}</span>
                                </div>
                                <div className="topic-actions" style={{ display: 'flex', gap: '6px', opacity: f.isPinned ? 1 : '' }}>
                                    <Star
                                        size={14}
                                        style={{ cursor: 'pointer', color: f.isPinned ? '#fbbf24' : 'var(--text-muted)' }}
                                        onClick={(e) => onToggleForkPin(e, f.title)}
                                        fill={f.isPinned ? "#fbbf24" : "none"}
                                    />
                                    <Trash2
                                        size={14}
                                        style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                                        onClick={(e) => onDeleteFork(e, f.title)}
                                    />
                                </div>
                            </div>
                        );
                    })
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
