import React, { useState, useEffect } from 'react';
import { Settings, X, Save } from 'lucide-react';

export default function SettingsPanel({ isOpen, onClose, onSave, initialSettings }) {
    const [apiKey, setApiKey] = useState(initialSettings.apiKey || '');
    const [depth, setDepth] = useState(initialSettings.depth || 3);
    const [language, setLanguage] = useState(initialSettings.language || 'en');
    const [baseUrl, setBaseUrl] = useState(initialSettings.baseUrl || '');
    const [timeRange, setTimeRange] = useState(initialSettings.timeRange || '');

    // Sync state if props change when opened
    useEffect(() => {
        if (isOpen) {
            setApiKey(initialSettings.apiKey || '');
            setDepth(initialSettings.depth || 3);
            setLanguage(initialSettings.language || 'en');
            setBaseUrl(initialSettings.baseUrl || '');
            setTimeRange(initialSettings.timeRange || '');
        }
    }, [isOpen, initialSettings]);

    const handleSave = () => {
        onSave({ apiKey, depth, language, baseUrl, timeRange });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-panel" onClick={e => e.stopPropagation()}>
                <div className="settings-header">
                    <h3><Settings size={20} /> Settings</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="settings-body">
                    <div className="form-group">
                        <label>Gemini API Key</label>
                        <input
                            type="password"
                            placeholder="AIzaSy..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <p className="help-text">Your key is stored locally in your browser.</p>
                    </div>

                    <div className="form-group">
                        <label>Custom Base URL (Optional)</label>
                        <input
                            type="text"
                            placeholder="https://generativelanguage.googleapis.com (e.g. proxy url)"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                        />
                        <p className="help-text">Leave blank if connecting directly, or set to proxy domain if blocked.</p>
                    </div>

                    <div className="form-group">
                        <label>Search Language</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', outline: 'none' }}>
                            <option value="en">English</option>
                            <option value="zh">Chinese</option>
                        </select>
                        <p className="help-text">Language for fetching news articles.</p>
                    </div>

                    <div className="form-group">
                        <label>Date Range</label>
                        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ padding: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', outline: 'none' }}>
                            <option value="">Any time</option>
                            <option value="1d">Past 24 hours</option>
                            <option value="7d">Past 7 days</option>
                            <option value="30d">Past 30 days</option>
                            <option value="1y">Past 1 year</option>
                        </select>
                        <p className="help-text">Restrict articles to a specific timeframe.</p>
                    </div>

                    <div className="form-group">
                        <label>Extraction Depth: {depth}</label>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            value={depth}
                            onChange={(e) => setDepth(parseInt(e.target.value))}
                            className="depth-slider"
                        />
                        <div className="range-labels">
                            <span>Main Event</span>
                            <span>Deep Chain</span>
                        </div>
                        <p className="help-text">
                            {depth === 1 && "Level 1: Extracts only the core event and immediate key players."}
                            {depth === 2 && "Level 2: Extracts core event + directly triggered sub-events."}
                            {depth === 3 && "Level 3: Extracts the full causal chain including grandchild events."}
                        </p>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="save-btn" onClick={handleSave}>
                        <Save size={16} /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
