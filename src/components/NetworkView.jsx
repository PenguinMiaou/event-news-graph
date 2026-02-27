import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

// Using a simplified force-directed approach with basic CSS/SVG
export default function NetworkView({ data, selectedNode, onNodeClick }) {
    const containerRef = useRef(null);
    const [nodes, setNodes] = useState([]);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Set initial positions based on a circle
        const width = typeof window !== 'undefined' ? window.innerWidth - 260 : 800;
        const height = typeof window !== 'undefined' ? window.innerHeight : 600;

        const positionedNodes = data.nodes.map((n, i) => {
            const angle = (i / data.nodes.length) * Math.PI * 2;
            const radius = 180 + (i % 2) * 60;
            return {
                ...n,
                x: width / 2 + Math.cos(angle) * radius,
                y: height / 2 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                targetX: width / 2 + Math.cos(angle) * radius,
                targetY: height / 2 + Math.sin(angle) * radius
            };
        });

        if (positionedNodes[0]) {
            positionedNodes[0].targetX = width / 2;
            positionedNodes[0].targetY = height / 2;
        }

        setNodes(positionedNodes);

    }, [data]);

    // Physics Engine for Hover Repulsion
    const mousePos = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef();

    useEffect(() => {
        const simulate = () => {
            setNodes(currentNodes => {
                let updated = false;
                const mx = mousePos.current.x;
                const my = mousePos.current.y;

                // 1. Identify hovered node (closest within 100px threshold)
                let closestNodeId = null;
                let minDist = 100;
                if (mx !== -1000) {
                    currentNodes.forEach(n => {
                        const dist = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2);
                        if (dist < minDist) {
                            minDist = dist;
                            closestNodeId = n.id;
                        }
                    });
                }

                const newNodes = currentNodes.map(node => {
                    let { x, y, vx, vy, targetX, targetY, id } = node;

                    // Spring force towards target (home) position
                    const dx = targetX - x;
                    const dy = targetY - y;
                    vx += dx * 0.05; // Spring stiffness
                    vy += dy * 0.05;

                    const distToMouse = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);

                    if (id === closestNodeId) {
                        // The user is hovering over this node (or it's the closest)
                        // Snap/pull strongly to the mouse pointer so it's perfectly clickable
                        vx += (mx - x) * 0.2;
                        vy += (my - y) * 0.2;

                        // Extremely heavy damping so it stops moving and locks in place
                        vx *= 0.3;
                        vy *= 0.3;
                    } else if (selectedNode && id === selectedNode.id) {
                        // The node is selected and the detail panel is open
                        // Pin it firmly in place so it doesn't float away
                        vx *= 0.1;
                        vy *= 0.1;
                    } else if (distToMouse < 200) {
                        // Create a larger clearing to prevent clutter
                        const force = (200 - distToMouse) * 0.04;
                        vx += ((x - mx) / distToMouse) * force;
                        vy += ((y - my) / distToMouse) * force;
                    }

                    // Normal Damping (Friction) for non-locked nodes
                    if (id !== closestNodeId && !(selectedNode && id === selectedNode.id)) {
                        vx *= 0.8;
                        vy *= 0.8;
                    }

                    x += vx;
                    y += vy;

                    if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1 || Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                        updated = true;
                    }

                    return { ...node, x, y, vx, vy, isHovered: id === closestNodeId };
                });

                return updated ? newNodes : currentNodes;
            });
            animationRef.current = requestAnimationFrame(simulate);
        };

        animationRef.current = requestAnimationFrame(simulate);
        return () => cancelAnimationFrame(animationRef.current);
    }, []);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    };

    const handleMouseMove = (e) => {
        const svgRect = containerRef.current.getBoundingClientRect();
        // Update mouse position mapped backwards through transform for the physics engine
        mousePos.current = {
            x: (e.clientX - svgRect.left - transform.x) / transform.scale,
            y: (e.clientY - svgRect.top - transform.y) / transform.scale
        };

        if (!isDragging) return;
        setTransform(t => ({
            ...t,
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        }));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        mousePos.current = { x: -1000, y: -1000 };
    };

    const handleZoomIn = () => setTransform(t => ({ ...t, scale: Math.min(3, t.scale + 0.2) }));
    const handleZoomOut = () => setTransform(t => ({ ...t, scale: Math.max(0.2, t.scale - 0.2) }));
    const handleReset = () => setTransform({ x: 0, y: 0, scale: 1 });

    const handleWheel = (e) => {
        const zoomSpeed = 0.001;
        setTransform(t => {
            const newScale = Math.max(0.2, Math.min(3, t.scale - e.deltaY * zoomSpeed));

            // Get mouse position relative to the container
            const svgRect = containerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - svgRect.left;
            const mouseY = e.clientY - svgRect.top;

            // Calculate where the mouse is in the unscaled SVG coordinate system
            const xInSvg = (mouseX - t.x) / t.scale;
            const yInSvg = (mouseY - t.y) / t.scale;

            // Calculate new offset so the same unscaled point remains under the mouse
            const newX = mouseX - xInSvg * newScale;
            const newY = mouseY - yInSvg * newScale;

            return { x: newX, y: newY, scale: newScale };
        });
    };

    return (
        <div
            className="network-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
            onClick={() => onNodeClick(null)}
        >
            <div className="controls-hint">Drag to pan, click nodes to interact</div>

            <svg className="network-svg">
                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
                    {/* Render links dynamically to avoid state lag */}
                    {data.links.map((link, i) => {
                        const sourceNode = nodes.find(n => n.id === link.source);
                        const targetNode = nodes.find(n => n.id === link.target);

                        if (!sourceNode || !targetNode) return null;

                        const isHighlighted = selectedNode && (sourceNode.id === selectedNode.id || targetNode.id === selectedNode.id);
                        // Calculate midpoint for label
                        const midX = (sourceNode.x + targetNode.x) / 2;
                        const midY = (sourceNode.y + targetNode.y) / 2;

                        return (
                            <g key={`link-${i}`}>
                                <line
                                    className={`link ${isHighlighted ? 'highlighted' : ''}`}
                                    x1={sourceNode.x}
                                    y1={sourceNode.y}
                                    x2={targetNode.x}
                                    y2={targetNode.y}
                                />
                                <text
                                    x={midX}
                                    y={midY}
                                    fill="var(--text-muted)"
                                    fontSize="10"
                                    textAnchor="middle"
                                    style={{ opacity: isHighlighted ? 1 : 0.4, transition: 'opacity 0.3s' }}
                                >
                                    {link.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Render nodes */}
                    {nodes.map((node) => {
                        const isHovered = node.isHovered;
                        const isSelected = selectedNode && selectedNode.id === node.id;
                        return (
                            <g
                                key={node.id}
                                className={`node node-group node-${node.type} ${isSelected ? 'selected' : ''} ${isHovered ? 'hover-locked' : ''}`}
                                transform={`translate(${node.x}, ${node.y})`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNodeClick(node);
                                }}
                            >
                                <circle r={isSelected ? 20 : 16} />
                                <text x={isSelected ? 24 : 20} y={4}>{node.title}</text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            <div className="zoom-controls">
                <button className="icon-btn" onClick={handleZoomIn}><ZoomIn size={18} /></button>
                <button className="icon-btn" onClick={handleReset}><Maximize size={18} /></button>
                <button className="icon-btn" onClick={handleZoomOut}><ZoomOut size={18} /></button>
            </div>
        </div>
    );
}
