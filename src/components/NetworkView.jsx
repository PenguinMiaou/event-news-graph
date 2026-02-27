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
        // Initial layout: randomly scatter in a loose circle so physics can sort it out
        const width = typeof window !== 'undefined' ? window.innerWidth - 260 : 800;
        const height = typeof window !== 'undefined' ? window.innerHeight : 600;

        const positionedNodes = data.nodes.map((n, i) => {
            const angle = (i / data.nodes.length) * Math.PI * 2;
            const radius = 100 + Math.random() * 200;
            return {
                ...n,
                x: width / 2 + Math.cos(angle) * Math.max(100, radius),
                y: height / 2 + Math.sin(angle) * Math.max(100, radius),
                vx: 0,
                vy: 0
            };
        });

        setNodes(positionedNodes);

    }, [data]);

    // Physics Engine for Force-Directed Layout & Hover Interaction
    const mousePos = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef();

    useEffect(() => {
        const width = typeof window !== 'undefined' ? window.innerWidth - 260 : 800;
        const height = typeof window !== 'undefined' ? window.innerHeight : 600;
        const centerX = width / 2;
        const centerY = height / 2;

        let frameCount = 0;

        const simulate = () => {
            frameCount++;
            const simulationSteps = frameCount < 30 ? 6 : 1;

            setNodes(currentNodes => {
                let updated = false;
                const mx = mousePos.current.x;
                const my = mousePos.current.y;

                // Work with a mutable copy of nodes
                let nextNodes = currentNodes.map(n => ({ ...n }));

                for (let step = 0; step < simulationSteps; step++) {
                    updated = false; // Reset per step, keep if final step moved

                    // 1. Identify hovered node
                    let closestNodeId = null;
                    let minDist = 100;
                    if (mx !== -1000) {
                        nextNodes.forEach(n => {
                            const dist = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2);
                            if (dist < minDist) {
                                minDist = dist;
                                closestNodeId = n.id;
                            }
                        });
                    }

                    // 2. Link Attraction (Spring Force)
                    data.links.forEach(link => {
                        const source = nextNodes.find(n => n.id === link.source);
                        const target = nextNodes.find(n => n.id === link.target);
                        if (source && target) {
                            const dx = target.x - source.x;
                            const dy = target.y - source.y;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                            // Target distance between connected nodes
                            const targetDist = 180;
                            const force = (dist - targetDist) * 0.03; // Spring stiffness

                            const fx = (dx / dist) * force;
                            const fy = (dy / dist) * force;

                            source.vx += fx;
                            source.vy += fy;
                            target.vx -= fx;
                            target.vy -= fy;

                            // Top-Down Hierarchical Flow Bias: Target should be visually lower than Source
                            const verticalBias = 0.5;
                            source.vy -= verticalBias;
                            target.vy += verticalBias;
                        }
                    });

                    // 3. Node Repulsion (Charge) & Gravity
                    for (let i = 0; i < nextNodes.length; i++) {
                        const node = nextNodes[i];
                        node.isHovered = node.id === closestNodeId;

                        // Repel every other node
                        for (let j = i + 1; j < nextNodes.length; j++) {
                            const other = nextNodes[j];
                            const dx = other.x - node.x;
                            const dy = other.y - node.y;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                            if (dist < 400) {
                                // Inverse square law repulsion
                                const force = 800 / (dist * dist);
                                const fx = (dx / dist) * force;
                                const fy = (dy / dist) * force;

                                node.vx -= fx;
                                node.vy -= fy;
                                other.vx += fx;
                                other.vy += fy;
                            }
                        }

                        // Gravity (gently pull entire graph toward center)
                        const gdx = centerX - node.x;
                        const gdy = centerY - node.y;
                        node.vx += gdx * 0.003;
                        node.vy += gdy * 0.003;

                        // Mouse Interaction
                        const distToMouse = Math.sqrt((node.x - mx) ** 2 + (node.y - my) ** 2);
                        if (node.id === closestNodeId) {
                            // Snap hovered node strongly to cursor
                            node.vx += (mx - node.x) * 0.2;
                            node.vy += (my - node.y) * 0.2;
                            node.vx *= 0.3;
                            node.vy *= 0.3;
                        } else if (selectedNode && node.id === selectedNode.id) {
                            // Pin selected node in place
                            node.vx *= 0.1;
                            node.vy *= 0.1;
                        } else if (distToMouse < 200 && mx !== -1000) {
                            // Push other nodes away from the cursor bubble
                            const force = (200 - distToMouse) * 0.02;
                            node.vx += ((node.x - mx) / distToMouse) * force;
                            node.vy += ((node.y - my) / distToMouse) * force;
                        }

                        // Global Damping / Friction
                        if (node.id !== closestNodeId && !(selectedNode && node.id === selectedNode.id)) {
                            node.vx *= 0.75;
                            node.vy *= 0.75;
                        }

                        node.x += node.vx;
                        node.y += node.vy;

                        if (Math.abs(node.vx) > 0.05 || Math.abs(node.vy) > 0.05) {
                            updated = true;
                        }
                    }
                } // End of fast-forward steps loop

                return updated ? nextNodes : currentNodes;
            });
            animationRef.current = requestAnimationFrame(simulate);
        };

        // Start loop
        animationRef.current = requestAnimationFrame(simulate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [data.links, selectedNode]);

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
                <defs>
                    <marker id="arrowhead" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" opacity="0.6" />
                    </marker>
                    <marker id="arrowhead-highlighted" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-color)" />
                    </marker>
                </defs>
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
                                    markerEnd={`url(#${isHighlighted ? 'arrowhead-highlighted' : 'arrowhead'})`}
                                />
                                <rect
                                    x={midX - (link.label.length * 3.5)}
                                    y={midY - 8}
                                    width={link.label.length * 7}
                                    height={16}
                                    fill="var(--panel-bg)"
                                    rx="4"
                                    style={{ opacity: isHighlighted ? 0.9 : 0.6, transition: 'opacity 0.3s' }}
                                />
                                <text
                                    x={midX}
                                    y={midY + 3}
                                    fill={isHighlighted ? "var(--accent-color)" : "var(--text-muted)"}
                                    fontSize="10"
                                    textAnchor="middle"
                                    style={{ opacity: isHighlighted ? 1 : 0.6, transition: 'opacity 0.3s', fontWeight: isHighlighted ? 600 : 'normal' }}
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
