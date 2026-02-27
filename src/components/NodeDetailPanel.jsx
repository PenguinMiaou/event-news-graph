import React from 'react';
import { X, GitFork, ExternalLink } from 'lucide-react';

export default function NodeDetailPanel({ node, isOpen, onClose, onFork }) {
    if (!node && !isOpen) return null;

    return (
        <div className={`detail-panel ${isOpen ? 'open' : ''}`}>
            {node && (
                <>
                    <div className="detail-header">
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                        <div className="node-type-badge">{node.type} node</div>
                        <h2 className="detail-title">{node.title}</h2>
                        <div className="detail-meta">
                            <span>{node.date}</span>
                            <span>•</span>
                            <span>{node.sources?.length || 0} Sources</span>
                        </div>
                    </div>

                    <div className="detail-content">
                        <div className="detail-summary">
                            {node.summary}
                        </div>

                        {node.sources && node.sources.length > 0 && (
                            <div className="diff-section">
                                <h4>Diff View: Media Slant</h4>
                                {node.sources.map((src, i) => (
                                    <div
                                        key={i}
                                        className={`diff-column ${src.slant === 'pro-merc' ? 'left-leaning' : src.slant === 'neutral' ? '' : 'right-leaning'}`}
                                    >
                                        <div className="diff-source">
                                            {src.url && src.url !== "URL of the article" ? (
                                                <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    {src.name} <ExternalLink size={12} style={{ display: 'inline', opacity: 0.5 }} />
                                                </a>
                                            ) : (
                                                <>{src.name} <ExternalLink size={12} style={{ display: 'inline', opacity: 0.5 }} /></>
                                            )}
                                        </div>
                                        <div className="diff-text">"{src.excerpt}"</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="detail-footer">
                        <button className="fork-btn" onClick={() => onFork(node.title)}>
                            <GitFork size={18} /> Fork This Event
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
