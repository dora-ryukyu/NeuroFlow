
import { type LayerDefinition, LayerType } from './types';

export const LAYER_DEFINITIONS: LayerDefinition[] = [
    // Core Layers
    {
        type: LayerType.INPUT,
        name: 'Input',
        category: 'Core',
        description: 'Defines the shape of the input data.',
        params: [
            { name: 'shape', label: 'Shape', type: 'string', defaultValue: '(1, 28, 28)', description: 'Sets the initial data shape. E.g., (3, 224, 224) for a 3-channel (color) 224x224 image.' },
        ],
    },
    {
        type: LayerType.LINEAR,
        name: 'Linear',
        category: 'Core',
        description: 'A fully connected layer.',
        params: [
            { name: 'out_features', label: 'Output Features', type: 'number', defaultValue: 10, description: 'The number of neurons. At the end of a network, this is often the number of classes for classification.' },
        ],
    },
    {
        type: LayerType.FLATTEN,
        name: 'Flatten',
        category: 'Core',
        description: 'Flattens multi-dimensional data into a single vector.',
        params: [],
    },
    // CNN Layers
    {
        type: LayerType.CONV2D,
        name: 'Conv2D',
        category: 'CNN',
        description: '2D convolution layer for feature extraction from images.',
        params: [
            { name: 'out_channels', label: 'Output Channels', type: 'number', defaultValue: 16, description: 'The number of filters to learn, which corresponds to the number of features to extract.' },
            { name: 'kernel_size', label: 'Kernel Size', type: 'number', defaultValue: 3, description: 'The size of the scanning filter (e.g., 3 for a 3x3 filter).' },
            { name: 'stride', label: 'Stride', type: 'number', defaultValue: 1, description: 'The step size the filter moves across the image. A larger value reduces output size faster.' },
            { name: 'padding', label: 'Padding', type: 'number', defaultValue: 1, description: 'Adds a border of zeros around the image to control spatial size reduction.' },
        ],
    },
    {
        type: LayerType.MAXPOOL2D,
        name: 'MaxPool2D',
        category: 'CNN',
        description: 'Downsamples the feature map by taking the max value.',
        params: [
            { name: 'kernel_size', label: 'Kernel Size', type: 'number', defaultValue: 2, description: 'The size of the window to take a max over.' },
            { name: 'stride', label: 'Stride', type: 'number', defaultValue: 2, description: 'The step size of the window. Often same as kernel_size.' },
        ],
    },
    {
        type: LayerType.BATCHNORM2D,
        name: 'BatchNorm2D',
        category: 'CNN',
        description: 'Normalizes activations to stabilize and speed up training.',
        params: [],
    },
    // RNN Layers
    {
        type: LayerType.LSTM,
        name: 'LSTM',
        category: 'RNN',
        description: 'Long Short-Term Memory layer, for sequential data.',
        params: [
            { name: 'hidden_size', label: 'Hidden Size', type: 'number', defaultValue: 128, description: 'The number of features in the hidden state.' },
            { name: 'num_layers', label: 'Num Layers', type: 'number', defaultValue: 1, description: 'Number of recurrent layers to stack.' },
            { name: 'bidirectional', label: 'Bidirectional', type: 'boolean', defaultValue: false, description: 'If True, becomes a bidirectional LSTM, processing sequence from both directions.' },
        ],
    },
    {
        type: LayerType.GRU,
        name: 'GRU',
        category: 'RNN',
        description: 'Gated Recurrent Unit, a simpler version of LSTM.',
        params: [
            { name: 'hidden_size', label: 'Hidden Size', type: 'number', defaultValue: 128, description: 'The number of features in the hidden state.' },
            { name: 'num_layers', label: 'Num Layers', type: 'number', defaultValue: 1, description: 'Number of recurrent layers to stack.' },
            { name: 'bidirectional', label: 'Bidirectional', type: 'boolean', defaultValue: false, description: 'If True, becomes a bidirectional GRU.' },
        ],
    },
    // Activation Functions
    {
        type: LayerType.RELU,
        name: 'ReLU',
        category: 'Activation',
        description: 'Rectified Linear Unit activation function.',
        params: [],
    },
    {
        type: LayerType.SIGMOID,
        name: 'Sigmoid',
        category: 'Activation',
        description: 'Sigmoid activation function. Squashes values to a range between 0 and 1.',
        params: [],
    },
    {
        type: LayerType.TANH,
        name: 'Tanh',
        category: 'Activation',
        description: 'Tanh activation function. Squashes values to a range between -1 and 1.',
        params: [],
    },
    // Regularization
    {
        type: LayerType.DROPOUT,
        name: 'Dropout',
        category: 'Regularization',
        description: 'Randomly zeroes some elements of the input tensor during training to prevent overfitting.',
        params: [
            { name: 'p', label: 'Probability (p)', type: 'number', defaultValue: 0.5, description: 'The probability of an element to be zeroed. Range: 0 to 1.'}
        ]
    },
    // Output Layers
    {
        type: LayerType.SOFTMAX,
        name: 'Softmax',
        category: 'Output',
        description: 'Converts logits into probabilities. Used as the last layer in multi-class classification.',
        params: []
    },
    {
        type: LayerType.IDENTITY,
        name: 'Identity',
        category: 'Output',
        description: 'A placeholder layer that returns its input. Useful for regression tasks or getting raw logits.',
        params: []
    },
];

export const LAYER_MAP = new Map(LAYER_DEFINITIONS.map(def => [def.type, def]));