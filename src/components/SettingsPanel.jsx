import React, { useState, useEffect } from 'react';
import { Settings, X, Save } from 'lucide-react';

export default function SettingsPanel({ isOpen, onClose, onSave, initialSettings }) {
    const [apiKey, setApiKey] = useState(initialSettings.apiKey || '');
    const [depth, setDepth] = useState(initialSettings.depth || 3);

    // Sync state if props change when opened
    useEffect(() => {
        if (isOpen) {
            setApiKey(initialSettings.apiKey || '');
            setDepth(initialSettings.depth || 3);
        }
    }, [isOpen, initialSettings]);

    const handleSave = () => {
        onSave({ apiKey, depth });
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
