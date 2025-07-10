
import { LayerType, type CanvasNodeData } from '../types';
import { calculateShapeProgression } from '../services/codeGenerator';

export enum TensorDim {
    D1, // Vector, e.g. (features)
    D3, // Image-like, e.g. (channels, height, width)
    ANY,
}

// Defines the expected input and output dimensionality for each layer type
export const LAYER_IO_SPECS: { [key in LayerType]?: { input: TensorDim, output: TensorDim } } = {
    [LayerType.CONV2D]: { input: TensorDim.D3, output: TensorDim.D3 },
    [LayerType.MAXPOOL2D]: { input: TensorDim.D3, output: TensorDim.D3 },
    [LayerType.BATCHNORM2D]: { input: TensorDim.D3, output: TensorDim.D3 },

    [LayerType.FLATTEN]: { input: TensorDim.ANY, output: TensorDim.D1 },
    
    [LayerType.LINEAR]: { input: TensorDim.D1, output: TensorDim.D1 },
    
    [LayerType.LSTM]: { input: TensorDim.D1, output: TensorDim.D1 }, // Simplified for this context
    [LayerType.GRU]: { input: TensorDim.D1, output: TensorDim.D1 }, // Simplified for this context
    
    // Activation functions can work on any tensor dimension
    [LayerType.RELU]: { input: TensorDim.ANY, output: TensorDim.ANY },
    [LayerType.SIGMOID]: { input: TensorDim.ANY, output: TensorDim.ANY },
    [LayerType.TANH]: { input: TensorDim.ANY, output: TensorDim.ANY },

    // Regularization
    [LayerType.DROPOUT]: { input: TensorDim.ANY, output: TensorDim.ANY },

    // Output
    [LayerType.SOFTMAX]: { input: TensorDim.D1, output: TensorDim.D1 },
    [LayerType.IDENTITY]: { input: TensorDim.ANY, output: TensorDim.ANY },
};


const getShapeDimFromShape = (shape: number[] | string): TensorDim => {
    if (typeof shape !== 'object' || !Array.isArray(shape)) return TensorDim.ANY;
    return shape.length > 1 ? TensorDim.D3 : TensorDim.D1;
}


export const checkConnection = (sortedNodes: CanvasNodeData[], fromNodeId: string, toNodeId: string): { valid: boolean; messageKey: string | null } => {
    
    const fromNodeIndex = sortedNodes.findIndex(n => n.id === fromNodeId);
    const toNode = sortedNodes.find(n => n.id === toNodeId);
    
    if (fromNodeIndex === -1 || !toNode) {
        return { valid: false, messageKey: 'validation.genericError' };
    }
    
    const newNodeSpec = LAYER_IO_SPECS[toNode.type];
    if (!newNodeSpec) return { valid: true, messageKey: null }; // Allow unknown types

    let fromNodeOutputDim: TensorDim;
    try {
        const progression = calculateShapeProgression(sortedNodes);
        const fromNodeProgression = progression.find(p => p.nodeId === fromNodeId);
        
        if (!fromNodeProgression || fromNodeProgression.error) {
            // Cannot determine output shape if the graph is already broken
             return { valid: true, messageKey: null }; // Allow connection to see the error in panel
        }
        fromNodeOutputDim = getShapeDimFromShape(fromNodeProgression.outputShape);
    } catch(e) {
        // If calculation fails, don't block the user. The error will show up in the panel.
        return { valid: true, messageKey: null };
    }
    
    const newNodeInputDim = newNodeSpec.input;

    // If either can accept/produce ANY dimension, the connection is valid
    if (fromNodeOutputDim === TensorDim.ANY || newNodeInputDim === TensorDim.ANY) {
        return { valid: true, messageKey: null };
    }

    // If dimensions match, the connection is valid
    if (fromNodeOutputDim === newNodeInputDim) {
        return { valid: true, messageKey:null };
    }
    
    // Provide specific error messages for common mistakes
    if (fromNodeOutputDim === TensorDim.D3 && newNodeInputDim === TensorDim.D1) {
        return { valid: false, messageKey: 'validation.flattenRequired' };
    }
    if (fromNodeOutputDim === TensorDim.D1 && newNodeInputDim === TensorDim.D3) {
        return { valid: false, messageKey: 'validation.convAfterDense' };
    }
    
    // Generic error for any other mismatch
    return { valid: false, messageKey: 'validation.genericError' };
}