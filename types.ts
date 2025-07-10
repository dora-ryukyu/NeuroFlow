
export enum LayerType {
    // Core
    INPUT = 'INPUT',
    LINEAR = 'LINEAR',
    FLATTEN = 'FLATTEN',

    // CNN
    CONV2D = 'CONV2D',
    MAXPOOL2D = 'MAXPOOL2D',
    BATCHNORM2D = 'BATCHNORM2D',

    // RNN
    LSTM = 'LSTM',
    GRU = 'GRU',

    // Activation
    RELU = 'RELU',
    SIGMOID = 'SIGMOID',
    TANH = 'TANH',

    // Regularization
    DROPOUT = 'DROPOUT',

    // Output
    SOFTMAX = 'SOFTMAX',
    IDENTITY = 'IDENTITY',
}

export interface ParameterDefinition {
    name: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    defaultValue: string | number | boolean;
    options?: string[];
    description: string;
}

export interface LayerDefinition {
    type: LayerType;
    name: string;
    description: string;
    category: 'Core' | 'CNN' | 'RNN' | 'Activation' | 'Regularization' | 'Output';
    params: ParameterDefinition[];
}

export interface CanvasNodeData {
    id: string;
    type: LayerType;
    name:string;
    params: { [key: string]: any };
    position: { x: number, y: number };
    next_node_id: string | null;
}

export interface TrainingConfig {
    optimizer: 'Adam' | 'SGD';
    learningRate: number;
    lossFunction: 'CrossEntropyLoss' | 'MSELoss';
    epochs: number;
    batchSize: number;
}

export type AiActionType = 'ADD_NODE' | 'CONNECT_NODES' | 'AUTO_LAYOUT';

export interface AiAction {
    type: AiActionType;
    payload: any;
}
