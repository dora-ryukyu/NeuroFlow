
import React, { useRef } from 'react';
import { CanvasNodeData, LayerType } from '../types';
import { ShapeInfo } from '../services/codeGenerator';
import { CloseIcon, BrainCircuitIcon } from './icons';
import { useTranslation } from '../i18n';
import { LAYER_MAP } from '../constants';
import { NODE_HEIGHT, NODE_WIDTH } from './Canvas';

interface ConnectionHandleProps {
    type: 'input' | 'output';
    onMouseDown?: (e: React.MouseEvent) => void;
    onMouseUp?: (e: React.MouseEvent) => void;
    isOccupied: boolean;
    isConnectable: boolean;
}

const ConnectionHandle: React.FC<ConnectionHandleProps> = ({ type, onMouseDown, onMouseUp, isOccupied, isConnectable }) => {
    const positionClass = type === 'input' ? '-left-3' : '-right-3';
    const baseClasses = `absolute top-1/2 ${positionClass} transform -translate-y-1/2 w-5 h-5 rounded-full border-2 border-[--color-bg-secondary] transition-all duration-200 z-10 cursor-crosshair`;
    
    let stateClasses = 'bg-[--color-text-secondary] group-hover:bg-[--color-primary]';
    if(isOccupied) stateClasses = 'bg-[--color-green]';
    if(isConnectable) stateClasses = 'bg-[--color-potential-target-bg] scale-125 ring-4 ring-[--color-potential-target-ring]';
    
    return <div className={`${baseClasses} ${stateClasses}`} onMouseDown={onMouseDown} onMouseUp={onMouseUp} />;
};

interface NodeProps {
    node: CanvasNodeData;
    isSelected: boolean;
    shapeInfo: ShapeInfo | undefined;
    onSelect: (id: string) => void;
    onDeleteNode: (id: string) => void;
    onUpdatePosition: (id: string, pos: { x: number; y: number }) => void;
    onStartConnection: (nodeId: string, e: React.MouseEvent) => void;
    onEndConnection: (nodeId: string, e: React.MouseEvent) => void;
    isInputOccupied: boolean;
    isOutputOccupied: boolean;
    isPotentialTarget: boolean;
    canvasScale: number;
}

const NodeComponent: React.FC<NodeProps> = React.memo(({ node, isSelected, shapeInfo, onSelect, onDeleteNode, onUpdatePosition, onStartConnection, onEndConnection, isInputOccupied, isOutputOccupied, isPotentialTarget, canvasScale }) => {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const isInputNode = node.type === LayerType.INPUT;

    const layerDef = LAYER_MAP.get(node.type);
    const translatedName = layerDef ? t(`layers.${node.type}.name`) : node.name;
    
    const formatShape = (shape: number[] | string) => (shape && typeof shape !== 'string') ? `(${shape.join(', ')})` : shape || 'N/A';
    const outputShapeStr = shapeInfo?.error ? "Error" : formatShape(shapeInfo?.outputShape);

    const cursorClass = isInputNode ? 'cursor-default' : 'cursor-grab';

    const baseClasses = `absolute p-3 rounded-lg shadow-xl transition-all duration-200 border-2 group bg-[--color-bg-secondary]`;
    const selectedClasses = isSelected 
        ? "border-[--color-primary] scale-105 z-20 shadow-[0_0_20px_var(--color-primary)]" 
        : `border-[--color-border] hover:border-[--color-text-secondary] ${isPotentialTarget ? 'ring-4 ring-[--color-potential-target-ring] border-[--color-potential-target-bg]' : ''}`;
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Ignore clicks on connection handles or buttons
        if ((e.target as HTMLElement).closest('[class*="-left-3"], [class*="-right-3"], button')) {
             return;
        }
        
        onSelect(node.id);

        if (isInputNode) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const startPos = { ...node.position };
        const startMouse = { x: e.clientX, y: e.clientY };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startMouse.x) / canvasScale;
            const dy = (moveEvent.clientY - startMouse.y) / canvasScale;
            onUpdatePosition(node.id, { x: startPos.x + dx, y: startPos.y + dy });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div 
            ref={ref}
            data-id={node.id}
            className={`${baseClasses} ${selectedClasses} ${cursorClass}`}
            style={{ left: node.position.x, top: node.position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
            onMouseDown={handleMouseDown}
            onMouseUp={(e) => onEndConnection(node.id, e)}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[--color-bg] rounded-md">
                    <BrainCircuitIcon className="h-5 w-5 text-[--color-primary]" />
                </div>
                <div>
                    <h3 className="font-bold text-[--color-text] text-base leading-tight">{translatedName}</h3>
                    <p className="text-xs text-[--color-text-secondary]">{t(`categories.${layerDef?.category}`)}</p>
                </div>
            </div>
             <div className="absolute bottom-2 left-3 text-xs font-mono px-2 py-0.5 rounded" title={t('properties.outputShape')}>
                <span className="text-[--color-text-secondary]">Out: </span>
                <span className={`font-semibold ${shapeInfo?.error ? 'text-[--color-red]' : 'text-[--color-green]'}`}>{outputShapeStr}</span>
            </div>

            {!isInputNode && (
                <button onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                    className="absolute -top-2 -right-2 p-1 bg-[--color-red] rounded-full text-white hover:opacity-80 transition-all z-30 opacity-0 group-hover:opacity-100"
                    aria-label={`Delete ${translatedName} node`}>
                    <CloseIcon className="h-3 w-3" />
                </button>
            )}
            
            {!isInputNode && <ConnectionHandle type="input" onMouseUp={(e) => onEndConnection(node.id, e)} isOccupied={isInputOccupied} isConnectable={isPotentialTarget} />}
            {layerDef?.category !== 'Output' && <ConnectionHandle type="output" onMouseDown={(e) => onStartConnection(node.id, e)} isOccupied={isOutputOccupied} isConnectable={false} />}
        </div>
    );
});

export default NodeComponent;