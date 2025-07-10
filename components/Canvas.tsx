
import React, { useState, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import { type CanvasNodeData, LayerType } from '../types';
import { ShapeInfo } from '../services/codeGenerator';
import NodeComponent from './Node';
import { PlusIcon, MinusIcon, FrameIcon, WandIcon, UnlinkIcon, BrainCircuitIcon } from './icons';
import { useTranslation } from '../i18n';

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 92;

interface CanvasProps {
    nodes: CanvasNodeData[];
    sortedNodes: CanvasNodeData[];
    shapeProgression: ShapeInfo[];
    selectedNodeId: string | null;
    onSelectNode: (id: string) => void;
    onDeleteNode: (id: string) => void;
    onUpdateNodePosition: (id: string, pos: { x: number, y: number }) => void;
    onSetConnection: (fromId: string, toId: string) => void;
    onRemoveConnection: (fromId: string) => void;
    onAddNode: (type: LayerType, position: {x: number, y: number}) => void;
    onAutoLayout: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ nodes, sortedNodes, shapeProgression, selectedNodeId, onSelectNode, onDeleteNode, onUpdateNodePosition, onSetConnection, onRemoveConnection, onAddNode, onAutoLayout }) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

    const [transform, setTransform] = useState({ x: 40, y: 100, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });

    const [draftConnection, setDraftConnection] = useState<{ fromId: string; toMouse: {x: number, y: number} } | null>(null);
    const [potentialTarget, setPotentialTarget] = useState<string|null>(null);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.2, transform.scale + scaleAmount), 2);
        
        if (!viewportRef.current) return;
        const rect = viewportRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
        const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

        setTransform({ x: newX, y: newY, scale: newScale });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('[data-id], button, a')) return;
        setIsPanning(true);
        panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
        if (viewportRef.current) viewportRef.current.style.cursor = 'grabbing';
    };
    
    const handleMouseUp = (e: React.MouseEvent) => {
        setIsPanning(false);
        if (draftConnection && potentialTarget) {
            onSetConnection(draftConnection.fromId, potentialTarget);
        }
        setDraftConnection(null);
        setPotentialTarget(null);
        if (viewportRef.current) viewportRef.current.style.cursor = 'grab';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setTransform(t => ({ ...t, x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y }));
        } else if (draftConnection) {
            if (!viewportRef.current) return;
            const rect = viewportRef.current.getBoundingClientRect();
            setDraftConnection(d => d && { ...d, toMouse: { 
                x: (e.clientX - rect.left - transform.x) / transform.scale, 
                y: (e.clientY - rect.top - transform.y) / transform.scale 
            }});
            const targetEl = (e.target as HTMLElement).closest('[data-id]');
            const targetId = targetEl ? targetEl.getAttribute('data-id') : null;
            setPotentialTarget(targetId);
        }
    };

    const handleStartConnection = (nodeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDraftConnection({ fromId: nodeId, toMouse: { x: 0, y: 0 } });
        if (viewportRef.current) viewportRef.current.style.cursor = 'crosshair';
    };
    
    const handleEndConnection = (nodeId: string, e: React.MouseEvent) => {
        if (draftConnection) {
            onSetConnection(draftConnection.fromId, nodeId);
        }
        setDraftConnection(null);
        setPotentialTarget(null);
        if (viewportRef.current) viewportRef.current.style.cursor = 'grab';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('layerType') as LayerType;
        if (type && viewportRef.current) {
            const rect = viewportRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - transform.x) / transform.scale;
            const y = (e.clientY - rect.top - transform.y) / transform.scale;
            onAddNode(type, {x, y});
        }
    };
    
    const getConnectorPoints = (fromNode: CanvasNodeData, toNode: CanvasNodeData) => {
        const start = { x: fromNode.position.x + NODE_WIDTH, y: fromNode.position.y + NODE_HEIGHT / 2 };
        const end = { x: toNode.position.x, y: toNode.position.y + NODE_HEIGHT / 2 };
        const dx = Math.abs(start.x - end.x);
        const controlX1 = start.x + Math.max(dx * 0.5, 50);
        const controlX2 = end.x - Math.max(dx * 0.5, 50);
        const midPoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        const pathData = `M ${start.x},${start.y} C ${controlX1},${start.y} ${controlX2},${end.y} ${end.x},${end.y}`;
        return { pathData, midPoint };
    };
    
    const getDraftConnectorPath = () => {
        if (!draftConnection) return '';
        const fromNode = nodeMap.get(draftConnection.fromId);
        if (!fromNode) return '';
        const start = { x: fromNode.position.x + NODE_WIDTH, y: fromNode.position.y + NODE_HEIGHT / 2 };
        const end = draftConnection.toMouse;
        const dx = Math.abs(start.x - end.x);
        const controlX1 = start.x + Math.max(dx * 0.5, 50);
        const controlX2 = end.x - Math.max(dx * 0.5, 50);
        return `M ${start.x},${start.y} C ${controlX1},${start.y} ${controlX2},${end.y} ${end.x},${end.y}`;
    }

    const zoom = useCallback((direction: 'in' | 'out') => {
        const scaleAmount = direction === 'in' ? 0.1 : -0.1;
        const newScale = Math.min(Math.max(0.2, transform.scale + scaleAmount), 2);
        setTransform(t => ({...t, scale: newScale}));
    }, [transform.scale]);

    const resetView = useCallback(() => setTransform({ x: 40, y: 100, scale: 1 }), []);

    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        if (viewport) {
             viewport.style.cursor = draftConnection ? 'crosshair' : 'grab';
             const handleMouseLeave = () => { setIsPanning(false); setDraftConnection(null); setPotentialTarget(null); };
             viewport.addEventListener('mouseleave', handleMouseLeave);
             return () => viewport.removeEventListener('mouseleave', handleMouseLeave);
        }
    }, [draftConnection]);

    return (
        <div 
            ref={viewportRef}
            className="flex-grow w-full h-full relative overflow-hidden bg-[--color-bg]"
            onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
        >
             <div
                className="absolute top-0 left-0 w-full h-full bg-grid-pattern"
                style={{
                    backgroundPosition: `${transform.x}px ${transform.y}px`,
                    backgroundSize: `${25 * transform.scale}px ${25 * transform.scale}px`,
                }}
            />
            <div
                className="absolute top-0 left-0"
                style={{ 
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                    width: '10000px', height: '10000px',
                }}
            >
                <svg className="absolute top-0 left-0" style={{ width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-text-secondary)" />
                        </marker>
                    </defs>
                     <style>{`
                        @keyframes dash { to { stroke-dashoffset: -100; } }
                        .flow-path { stroke-dasharray: 8 8; animation: dash 5s linear infinite; }
                     `}</style>
                    {sortedNodes.map((node) => {
                        if (!node.next_node_id) return null;
                        const nextNode = nodeMap.get(node.next_node_id);
                        if (!nextNode) return null;
                        const { pathData, midPoint } = getConnectorPoints(node, nextNode);
                        return (
                            <g key={`conn-${node.id}`} className="group/conn" style={{ pointerEvents: 'auto'}}>
                                <path d={pathData} fill="none" stroke="transparent" strokeWidth="20" />
                                <path d={pathData} fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
                                <path d={pathData} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" className="flow-path transition-all opacity-0 group-hover/conn:opacity-100" />
                                 <foreignObject x={midPoint.x - 12} y={midPoint.y - 12} width="24" height="24">
                                      <button onClick={() => onRemoveConnection(node.id)} title={t('canvas.disconnect')} className="p-1.5 bg-[--color-bg-secondary] border border-[--color-border] rounded-full text-[--color-text-secondary] hover:bg-[--color-red] hover:text-white transition-all opacity-0 group-hover/conn:opacity-100 flex items-center justify-center">
                                          <UnlinkIcon className="h-3 w-3" />
                                      </button>
                                </foreignObject>
                            </g>
                        );
                    })}
                    <path d={getDraftConnectorPath()} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeDasharray="6,6" />
                </svg>

                {nodes.map((node) => (
                    <NodeComponent
                        key={node.id}
                        node={node}
                        isSelected={node.id === selectedNodeId}
                        shapeInfo={shapeProgression.find(p => p.nodeId === node.id)}
                        onSelect={onSelectNode} 
                        onDeleteNode={onDeleteNode} 
                        onUpdatePosition={onUpdateNodePosition}
                        onStartConnection={handleStartConnection} 
                        onEndConnection={handleEndConnection}
                        isInputOccupied={nodes.some(n => n.next_node_id === node.id)}
                        isOutputOccupied={!!node.next_node_id}
                        isPotentialTarget={draftConnection !== null && potentialTarget === node.id && draftConnection.fromId !== node.id && !nodes.some(n => n.next_node_id === node.id)}
                        canvasScale={transform.scale}
                    />
                ))}
            </div>

            {draftConnection && (
                 <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[--color-bg-secondary]/80 text-[--color-text] px-4 py-2 rounded-lg pointer-events-none transition-opacity duration-200">
                    {t('canvas.connectionGuide')}
                </div>
            )}
            
            {nodes.length === 1 && nodes[0].type === 'INPUT' && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center p-8 rounded-xl bg-[--color-bg]/50">
                        <BrainCircuitIcon className="mx-auto h-24 w-24 text-[--color-text-secondary] opacity-10" />
                        <p className="mt-4 text-xl font-semibold text-[--color-text]">{t('canvas.empty.title')}</p>
                        <p className="text-[--color-text-secondary]">{t('canvas.empty.subtitle')}</p>
                    </div>
                </div>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 bg-[--color-bg-secondary]/80 backdrop-blur-md p-2 rounded-xl border border-[--color-border] shadow-lg">
                <button title={t('canvas.controls.autoLayout')} onClick={onAutoLayout} className="p-2 bg-transparent rounded-md text-[--color-text-secondary] hover:bg-[--color-primary] hover:text-white transition-colors"><WandIcon className="h-5 w-5"/></button>
                <div className="w-px h-6 bg-[--color-border] mx-1"></div>
                <button title={t('canvas.controls.zoomIn')} onClick={() => zoom('in')} className="p-2 bg-transparent rounded-md text-[--color-text-secondary] hover:bg-[--color-primary] hover:text-white transition-colors"><PlusIcon className="h-5 w-5"/></button>
                <button title={t('canvas.controls.zoomOut')} onClick={() => zoom('out')} className="p-2 bg-transparent rounded-md text-[--color-text-secondary] hover:bg-[--color-primary] hover:text-white transition-colors"><MinusIcon className="h-5 w-5"/></button>
                <button title={t('canvas.controls.resetView')} onClick={resetView} className="p-2 bg-transparent rounded-md text-[--color-text-secondary] hover:bg-[--color-primary] hover:text-white transition-colors"><FrameIcon className="h-5 w-5"/></button>
            </div>
        </div>
    );
};

export default Canvas;
