
import { type AiAction, LayerType } from './types';

export interface Recipe {
    id: string;
    titleKey: string;
    descriptionKey: string;
    actions: AiAction[];
}

export const RECIPES: Recipe[] = [
    {
        id: 'simple_cnn',
        titleKey: 'recipes.simple_cnn.title',
        descriptionKey: 'recipes.simple_cnn.description',
        actions: [
            { "type": "ADD_NODE", "payload": { "type": LayerType.CONV2D, "params": { "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "INPUT_NODE", "toId": "NEW_NODE_0" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_2" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.MAXPOOL2D, "params": { "kernel_size": 2, "stride": 2 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_4" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.FLATTEN, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_6" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 10 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_8" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.SOFTMAX, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_10" } },
            { "type": "AUTO_LAYOUT", "payload": {} }
        ]
    },
    {
        id: 'vgg_style_cnn',
        titleKey: 'recipes.vgg_style_cnn.title',
        descriptionKey: 'recipes.vgg_style_cnn.description',
        actions: [
            { "type": "ADD_NODE", "payload": { "type": LayerType.CONV2D, "params": { "out_channels": 32, "kernel_size": 3, "stride": 1, "padding": 1 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "INPUT_NODE", "toId": "NEW_NODE_0" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_2" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.CONV2D, "params": { "out_channels": 32, "kernel_size": 3, "stride": 1, "padding": 1 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_4" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_6" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.MAXPOOL2D, "params": { "kernel_size": 2, "stride": 2 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_8" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.FLATTEN, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_10" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 128 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_12" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_14" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 10 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_16" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.SOFTMAX, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_18" } },
            { "type": "AUTO_LAYOUT", "payload": {} }
        ]
    },
    {
        id: 'mlp',
        titleKey: 'recipes.mlp.title',
        descriptionKey: 'recipes.mlp.description',
        actions: [
            { "type": "ADD_NODE", "payload": { "type": LayerType.FLATTEN, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "INPUT_NODE", "toId": "NEW_NODE_0" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 128 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_2" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_4" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.DROPOUT, "params": { "p": 0.5 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_6" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 10 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_8" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.SOFTMAX, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_10" } },
            { "type": "AUTO_LAYOUT", "payload": {} }
        ]
    },
    {
        id: 'regression_mlp',
        titleKey: 'recipes.regression_mlp.title',
        descriptionKey: 'recipes.regression_mlp.description',
        actions: [
            { "type": "ADD_NODE", "payload": { "type": LayerType.FLATTEN, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "INPUT_NODE", "toId": "NEW_NODE_0" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 64 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_2" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_4" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 32 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_6" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_8" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 1 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_10" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.IDENTITY, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_12" } },
            { "type": "AUTO_LAYOUT", "payload": {} }
        ]
    },
     {
        id: 'simple_rnn',
        titleKey: 'recipes.simple_rnn.title',
        descriptionKey: 'recipes.simple_rnn.description',
        actions: [
            { "type": "ADD_NODE", "payload": { "type": LayerType.FLATTEN, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "INPUT_NODE", "toId": "NEW_NODE_0" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LSTM, "params": { "hidden_size": 128, "num_layers": 2, "bidirectional": false } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_2" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 10 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_4" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.SOFTMAX, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_6" } },
            { "type": "AUTO_LAYOUT", "payload": {} }
        ]
    },
    {
        id: 'autoencoder',
        titleKey: 'recipes.autoencoder.title',
        descriptionKey: 'recipes.autoencoder.description',
        actions: [
            // Encoder
            { "type": "ADD_NODE", "payload": { "type": LayerType.FLATTEN, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "INPUT_NODE", "toId": "NEW_NODE_0" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 128 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_2" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_4" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 64 } } }, // Bottleneck
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_6" } },
            // Decoder
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_8" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 128 } } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_10" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.RELU, "params": {} } },
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_12" } },
            { "type": "ADD_NODE", "payload": { "type": LayerType.LINEAR, "params": { "out_features": 784 } } }, // Reconstruct original 28*28 shape
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_14" } },
             { "type": "ADD_NODE", "payload": { "type": LayerType.SIGMOID, "params": {} } }, // To scale output between 0-1 like normalized images
            { "type": "CONNECT_NODES", "payload": { "fromId": "LAST_NODE", "toId": "NEW_NODE_16" } },
            { "type": "AUTO_LAYOUT", "payload": {} }
        ]
    }
];
