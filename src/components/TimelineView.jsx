import React from 'react';

export default function TimelineView({ data, selectedNode, onNodeClick }) {
    // Sort nodes by date
    const sortedNodes = [...data.nodes].sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="timeline-container">
            <div className="timeline">
                {sortedNodes.map((node, index) => {
                    const isSelected = selectedNode && selectedNode.id === node.id;
                    return (
                        <div
                            key={node.id}
                            className="timeline-item"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="timeline-dot" onClick={() => onNodeClick(node)}></div>
                            <div
                                className={`timeline-card ${isSelected ? 'focused' : ''}`}
                                onClick={() => onNodeClick(node)}
                            >
                                <div className="timeline-date">{node.date}</div>
                                <h3>{node.title}</h3>
                                <p>{node.summary}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
