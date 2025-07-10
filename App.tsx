
import React, { useState, useCallback, useMemo, useReducer, Reducer, useEffect } from 'react';
import { LayerType, type CanvasNodeData, type TrainingConfig, AiAction } from './types';
import Header from './components/Header';
import LayerLibrary from './components/LayerLibrary';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import LearningLabModal from './components/LearningLabModal';
import CodeOutputModal from './components/CodeOutputModal';
import ArchitectureRecipes from './components/ArchitectureRecipes';
import { generatePyTorchCode, calculateShapeProgression, ShapeInfo } from './services/codeGenerator';
import { LogoIcon, CodeIcon, LabIcon, ErrorIcon, CloseIcon, InfoIcon } from './components/icons';
import { useTranslation } from './i18n';
import { checkConnection } from './utils/validation';
import { LAYER_DEFINITIONS, LAYER_MAP } from './constants';

// --- Toast Components ---
export interface ToastData {
    id: number;
    message: string;
    type: 'error' | 'info' | 'success';
}

interface ToastProps {
    toast: ToastData;
    onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), 5000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);
    
    const colors = {
      error: { bg: 'bg-[--color-toast-error-bg]', icon: 'text-[--color-toast-error-icon]' },
      info: { bg: 'bg-[--color-toast-info-bg]', icon: 'text-[--color-toast-info-icon]' },
      success: { bg: 'bg-[--color-toast-success-bg]', icon: 'text-[--color-toast-success-icon]' },
    }
    const { bg, icon } = colors[toast.type];
    const Icon = toast.type === 'error' ? ErrorIcon : toast.type === 'success' ? LabIcon : InfoIcon;

    return (
        <div className={`w-full max-w-sm rounded-lg shadow-lg pointer-events-auto ring-1 ring-black/5 dark:ring-white/10 overflow-hidden ${bg} backdrop-blur-sm animate-fade-in-up`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0"><Icon className={`h-6 w-6 ${icon}`} /></div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-[--color-text]">{toast.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button onClick={() => onDismiss(toast.id)} className="inline-flex rounded-md text-[--color-text-secondary] hover:text-[--color-text] focus:outline-none">
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastData[];
    onDismiss: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => (
    <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-[100]">
        <div className="w-full max-w-sm space-y-4">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    </div>
);
// --- End Toast Components ---

// --- State Management using useReducer ---
interface AppState {
    nodes: CanvasNodeData[];
    selectedNodeId: string | null;
}

type AppAction =
    | { type: 'ADD_NODE'; payload: { type: LayerType; position?: {x: number, y: number} } }
    | { type: 'DELETE_NODE'; payload: { id: string } }
    | { type: 'SELECT_NODE'; payload: { id: string | null } }
    | { type: 'UPDATE_NODE_POSITION'; payload: { id: string; position: { x: number; y: number } } }
    | { type: 'UPDATE_MULTIPLE_NODE_POSITIONS'; payload: { positions: { id: string, position: { x: number, y: number} }[] } }
    | { type: 'UPDATE_NODE_PARAMS'; payload: { id: string; params: any } }
    | { type: 'SET_CONNECTION'; payload: { fromId: string; toId: string } }
    | { type: 'REMOVE_CONNECTION'; payload: { fromId: string } }
    | { type: 'PROCESS_AI_ACTIONS'; payload: { actions: AiAction[] } }
    | { type: 'RESET_CANVAS' };

const createInitialState = (): AppState => {
    const inputNodeId = `node_${Date.now()}`;
    return {
        nodes: [{ id: inputNodeId, type: LayerType.INPUT, name: 'Input', params: { shape: '(1, 28, 28)' }, position: { x: 50, y: 150 }, next_node_id: null }],
        selectedNodeId: inputNodeId,
    };
};

const appReducer: Reducer<AppState, AppAction> = (state, action): AppState => {
    switch (action.type) {
        case 'ADD_NODE': {
            const def = LAYER_DEFINITIONS.find(d => d.type === action.payload.type);
            if (!def) return state;

            const defaultParams = def.params.reduce((acc, p) => ({ ...acc, [p.name]: p.defaultValue }), {} as any);
            const newNodeId = `node_${Date.now()}`;
            
            if (action.payload.position) {
                const newNode: CanvasNodeData = {
                    id: newNodeId, type: action.payload.type, name: def.name, params: defaultParams, position: action.payload.position, next_node_id: null };
                return { ...state, nodes: [...state.nodes, newNode], selectedNodeId: newNodeId };
            }

            const sortedNodes = getSortedNodes(state.nodes);
            const lastNode = sortedNodes.length > 0 ? sortedNodes[sortedNodes.length - 1] : null;
            const position = { x: lastNode ? lastNode.position.x + 250 : 50, y: lastNode ? lastNode.position.y : 150 };
            const newNode: CanvasNodeData = { id: newNodeId, type: action.payload.type, name: def.name, params: defaultParams, position, next_node_id: null };
            
            if (lastNode && LAYER_MAP.get(lastNode.type)?.category !== 'Output') {
                const newNodes = state.nodes.map(node => node.id === lastNode.id ? { ...node, next_node_id: newNode.id } : node);
                return { ...state, nodes: [...newNodes, newNode], selectedNodeId: newNode.id };
            } else {
                return { ...state, nodes: [...state.nodes, newNode], selectedNodeId: newNode.id };
            }
        }
        case 'DELETE_NODE': {
             const { id } = action.payload;
             if (state.nodes.find(n => n.id === id)?.type === LayerType.INPUT) return state;
             const newNodes = state.nodes.filter(node => node.id !== id).map(node => node.next_node_id === id ? { ...node, next_node_id: null } : node);
             let newSelectedId = state.selectedNodeId;
             if (state.selectedNodeId === id) {
                 const parentNode = state.nodes.find(n => n.next_node_id === id);
                 newSelectedId = parentNode ? parentNode.id : newNodes.length > 0 ? newNodes[0].id : null;
             }
            return { ...state, nodes: newNodes, selectedNodeId: newSelectedId };
        }
        case 'SELECT_NODE': return { ...state, selectedNodeId: action.payload.id };
        case 'UPDATE_NODE_POSITION': return { ...state, nodes: state.nodes.map(n => n.id === action.payload.id ? { ...n, position: action.payload.position } : n) };
        case 'UPDATE_MULTIPLE_NODE_POSITIONS': return { ...state, nodes: state.nodes.map(node => { const newPos = action.payload.positions.find(p => p.id === node.id); return newPos ? { ...node, position: newPos.position } : node; }) };
        case 'UPDATE_NODE_PARAMS': return { ...state, nodes: state.nodes.map(n => n.id === action.payload.id ? { ...n, params: { ...n.params, ...action.payload.params } } : n) };
        case 'SET_CONNECTION': return { ...state, nodes: state.nodes.map(n => n.id === action.payload.fromId ? { ...n, next_node_id: action.payload.toId } : n) };
        case 'REMOVE_CONNECTION': return { ...state, nodes: state.nodes.map(n => n.id === action.payload.fromId ? { ...n, next_node_id: null } : n) };
        case 'RESET_CANVAS': {
             return createInitialState();
        }
        case 'PROCESS_AI_ACTIONS': {
            const { actions } = action.payload;
            let newNodes: CanvasNodeData[] = createInitialState().nodes;
            const inputNodeId = newNodes[0].id;
            const actionNodeIdMap: { [key: string]: string } = {};

            const resolveLastNodeId = (currentNodes: CanvasNodeData[]): string => {
                const startNode = currentNodes.find(n => n.type === LayerType.INPUT);
                if (!startNode) return currentNodes.length > 0 ? currentNodes[0].id : '';

                const nodeMap = new Map(currentNodes.map(n => [n.id, n]));
                let lastNodeInChain = startNode;
                let currentNode: CanvasNodeData | undefined = startNode;
                const visited = new Set<string>();
                
                while (currentNode) {
                    if (visited.has(currentNode.id)) break;
                    visited.add(currentNode.id);
                    lastNodeInChain = currentNode;
                    currentNode = currentNode.next_node_id ? nodeMap.get(currentNode.next_node_id) : undefined;
                }
                return lastNodeInChain.id;
            };

            actions.forEach((action, index) => {
                if (action.type === 'ADD_NODE') {
                    const def = LAYER_DEFINITIONS.find(d => d.type === action.payload.type);
                    if (!def) return;
                    const defaultParams = def.params.reduce((acc, p) => ({ ...acc, [p.name]: p.defaultValue }), {} as any);
                    const newNodeId = `node_recipe_${Date.now()}_${index}`;
                    actionNodeIdMap[`NEW_NODE_${index}`] = newNodeId;
                    const newNode: CanvasNodeData = {
                        id: newNodeId, type: action.payload.type, name: def.name,
                        params: { ...defaultParams, ...action.payload.params },
                        position: { x: 0, y: 0 },
                        next_node_id: null
                    };
                    newNodes.push(newNode);
                } else if (action.type === 'CONNECT_NODES') {
                    const fromIdStr = action.payload.fromId;
                    const toIdStr = action.payload.toId;
                    
                    const fromId = fromIdStr === 'LAST_NODE' ? resolveLastNodeId(newNodes) :
                                   fromIdStr === 'INPUT_NODE' ? inputNodeId :
                                   actionNodeIdMap[fromIdStr] || fromIdStr;
                                   
                    const toId = actionNodeIdMap[toIdStr] || toIdStr;
                    
                    const fromNodeIndex = newNodes.findIndex(n => n.id === fromId);
                    if (fromNodeIndex !== -1) {
                        newNodes[fromNodeIndex] = { ...newNodes[fromNodeIndex], next_node_id: toId };
                    }
                }
            });

            const sortedFinalNodes = getSortedNodes(newNodes);
            const lastNode = sortedFinalNodes.length > 0 ? sortedFinalNodes[sortedFinalNodes.length - 1] : null;
            return { ...state, nodes: newNodes, selectedNodeId: lastNode ? lastNode.id : inputNodeId };
        }
        default: return state;
    }
};


export const getSortedNodes = (nodes: CanvasNodeData[]): CanvasNodeData[] => {
    if (nodes.length === 0) return [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const sorted: CanvasNodeData[] = [];
    const visited = new Set<string>();
    
    let inputNode = nodes.find(n => n.type === LayerType.INPUT);
    if (!inputNode) {
        inputNode = nodes.find(n => !nodes.some(other => other.next_node_id === n.id));
        if (!inputNode) return nodes;
    }

    let currentNode: CanvasNodeData | undefined = inputNode;
    while (currentNode) {
        if (visited.has(currentNode.id)) { console.error("Cycle detected in graph."); return sorted; }
        visited.add(currentNode.id);
        sorted.push(currentNode);
        currentNode = currentNode.next_node_id ? nodeMap.get(currentNode.next_node_id) : undefined;
    }
    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            sorted.push(node);
        }
    });

    return sorted;
};

const App: React.FC = () => {
    const { t } = useTranslation();
    const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
    const { nodes, selectedNodeId } = state;

    const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({ optimizer: 'Adam', learningRate: 0.001, lossFunction: 'CrossEntropyLoss', epochs: 10, batchSize: 64 });
    const [isLayerLibraryOpen, setLayerLibraryOpen] = useState(true);
    const [isPropertiesPanelOpen, setPropertiesPanelOpen] = useState(true);
    const [isLearningLabOpen, setLearningLabOpen] = useState(false);
    const [isCodeModalOpen, setCodeModalOpen] = useState(false);
    const [isRecipesOpen, setRecipesOpen] = useState(false);
    const [needsAutoLayout, setNeedsAutoLayout] = useState(false);

    
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const addToast = useCallback((message: string, type: ToastData['type']) => {
        setToasts(currentToasts => [...currentToasts, { id: Date.now(), message, type }]);
    }, []);
    const removeToast = (id: number) => setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    
    const sortedNodes = useMemo(() => getSortedNodes(nodes), [nodes]);
    const shapeProgression = useMemo(() => calculateShapeProgression(sortedNodes), [sortedNodes]);

    const addNode = useCallback((type: LayerType, position?: {x: number, y: number}) => {
        const isOutputLayer = LAYER_MAP.get(type)?.category === 'Output';
        const hasOutputLayer = sortedNodes.some(n => LAYER_MAP.get(n.type)?.category === 'Output');
        if (isOutputLayer && hasOutputLayer) { addToast(t('validation.outputLayerExists'), 'error'); return; }
        dispatch({ type: 'ADD_NODE', payload: { type, position } });
    }, [addToast, t, sortedNodes]);

    const handleSetConnection = useCallback((fromId: string, toId: string) => {
        const fromNode = nodes.find(n => n.id === fromId);
        const toNode = nodes.find(n => n.id === toId);
        if (!fromNode || !toNode) return;
        if (fromNode.next_node_id) { addToast(t('validation.outputOccupied'), 'error'); return; }
        if (nodes.some(n => n.next_node_id === toId)) { addToast(t('validation.inputOccupied'), 'error'); return; }
        if (toNode.type === LayerType.INPUT) { addToast(t('validation.cannotConnectToInput'), 'error'); return; }
        const tempSortedNodes = getSortedNodes(nodes.map(n => n.id === fromId ? { ...n, next_node_id: toId } : n));
        const validation = checkConnection(tempSortedNodes, fromId, toId);
        if (validation.valid) {
            dispatch({ type: 'SET_CONNECTION', payload: { fromId, toId } });
        } else {
            addToast(t(validation.messageKey || 'validation.genericError'), 'error');
        }
    }, [nodes, addToast, t]);

    const selectedNode = useMemo(() => nodes.find(node => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);

    const handleAutoLayout = useCallback(() => {
        const PADDING_X = 250;
        const PADDING_Y = 150;
        const currentSortedNodes = getSortedNodes(nodes);
        const newPositions = currentSortedNodes.map((node, index) => ({ id: node.id, position: { x: 50 + index * PADDING_X, y: PADDING_Y } }));
        dispatch({ type: 'UPDATE_MULTIPLE_NODE_POSITIONS', payload: { positions: newPositions } });
    }, [nodes]);

    useEffect(() => {
        if (needsAutoLayout) {
            setTimeout(() => {
                handleAutoLayout();
                setNeedsAutoLayout(false);
            }, 50);
        }
    }, [needsAutoLayout, handleAutoLayout]);

    const handleResetCanvas = useCallback(() => {
        dispatch({ type: 'RESET_CANVAS' });
        addToast(t('canvas.resetMessage'), 'info');
    }, [t, addToast, dispatch]);

    const handleBuildFromRecipe = useCallback((actions: AiAction[]) => {
        addToast(t('recipes.building'), 'info');
        const hasAutoLayout = actions.some(a => a.type === 'AUTO_LAYOUT');
        dispatch({ type: 'PROCESS_AI_ACTIONS', payload: { actions } });
        if (hasAutoLayout) {
            setNeedsAutoLayout(true);
        }
    }, [addToast, t, dispatch]);

    return (
        <div className="flex flex-col h-screen font-sans bg-[--color-bg] text-[--color-text] overflow-hidden">
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
            <Header
                onToggleLayers={() => setLayerLibraryOpen(v => !v)}
                onToggleProperties={() => setPropertiesPanelOpen(v => !v)}
                onOpenLearningLab={() => setLearningLabOpen(true)}
                onGenerateCode={() => setCodeModalOpen(true)}
                onToggleRecipes={() => setRecipesOpen(v => !v)}
                onReset={handleResetCanvas}
                isLayersOpen={isLayerLibraryOpen}
                isPropertiesOpen={isPropertiesPanelOpen}
                isRecipesOpen={isRecipesOpen}
            />
            <main className="flex flex-grow overflow-hidden relative">
                <LayerLibrary onAddNode={addNode} isOpen={isLayerLibraryOpen} onClose={() => setLayerLibraryOpen(false)} />
                <div className="flex-grow flex flex-col relative">
                    <Canvas
                        nodes={nodes}
                        sortedNodes={sortedNodes}
                        shapeProgression={shapeProgression}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={(id) => dispatch({type: 'SELECT_NODE', payload: {id}})}
                        onDeleteNode={(id) => dispatch({type: 'DELETE_NODE', payload: {id}})}
                        onUpdateNodePosition={(id, position) => dispatch({type: 'UPDATE_NODE_POSITION', payload: {id, position}})}
                        onSetConnection={handleSetConnection}
                        onRemoveConnection={(fromId) => dispatch({type: 'REMOVE_CONNECTION', payload: {fromId}})}
                        onAddNode={addNode}
                        onAutoLayout={handleAutoLayout}
                    />
                </div>
                <PropertiesPanel
                    node={selectedNode}
                    shapeProgression={shapeProgression}
                    onUpdateParams={(id, params) => dispatch({type: 'UPDATE_NODE_PARAMS', payload: {id, params}})}
                    onDeleteNode={(id) => dispatch({type: 'DELETE_NODE', payload: {id}})}
                    isOpen={isPropertiesPanelOpen}
                    onClose={() => setPropertiesPanelOpen(false)}
                />
                 <ArchitectureRecipes
                    isOpen={isRecipesOpen}
                    onClose={() => setRecipesOpen(false)}
                    onBuild={handleBuildFromRecipe}
                />
            </main>

            {isLearningLabOpen && <LearningLabModal config={trainingConfig} onSave={setTrainingConfig} onClose={() => setLearningLabOpen(false)} />}
            {isCodeModalOpen && <CodeOutputModal sortedNodes={sortedNodes} trainingConfig={trainingConfig} onClose={() => setCodeModalOpen(false)} addToast={addToast} />}
        </div>
    );
};

export default App;