
import { createContext, useContext, useCallback } from 'react';

// NOTE: The LanguageProvider component has been moved to index.tsx to resolve a JSX parsing issue with .ts files.

export type Language = 'ja' | 'en';

export const translations = {
    ja: {
        header: {
            title: 'NeuroFlow',
            buttons: {
                toggleLayers: 'レイヤーパネルを開閉',
                toggleProperties: 'プロパティパネルを開閉',
                learningLab: '学習設定ラボ',
                generateCode: 'コード生成',
                recipes: 'レシピ',
                reset: 'リセット'
            }
        },
        common: {
            cancel: 'キャンセル',
            true: 'はい',
            false: 'いいえ',
            build: '構築'
        },
        confirm: {
            reset: '本当にキャンバスをリセットしますか？現在のネットワークは失われます。',
            buildRecipe: '現在のネットワークをクリアし、選択したレシピを構築します。よろしいですか？'
        },
        layerLibrary: {
            title: 'レイヤー'
        },
        categories: {
            Core: 'コア',
            CNN: 'CNN',
            RNN: 'RNN',
            Activation: '活性化関数',
            Regularization: '正則化',
            Output: '出力',
        },
        layers: {
            INPUT: { name: '入力', description: 'AIに与える最初のデータの形を決めます。', params: { shape: { label: '形状 (shape)', description: '例: (3, 224, 224) は「3チャンネル(カラー)で224x224ピクセルの画像」という意味です。' } } },
            LINEAR: { name: '全結合層', description: 'すべてのニューロンが次の層のすべてのニューロンに接続されているレイヤーです。', params: { out_features: { label: '出力数 (out_features)', description: 'ニューロンの数です。ネットワークの最終段で、分類するクラスの数を指定することが多いです。' } } },
            FLATTEN: { name: '平坦化', description: '多次元データを、全結合層に入力できるよう1列の平坦なデータに変換します。', params: {} },
            CONV2D: { name: '畳み込み (Conv2D)', description: '画像から輪郭などの空間的な特徴を抽出します。', params: { out_channels: { label: '出力チャンネル数', description: '学習するフィルターの数。抽出する特徴の種類数を決めます。' }, kernel_size: { label: 'カーネルサイズ', description: '特徴を抽出する「虫眼鏡」の大きさです。' }, stride: { label: 'ストライド', description: '「虫眼鏡」を動かす歩幅。大きいと画像が速く小さくなります。' }, padding: { label: 'パディング', description: '画像の端を0で埋め、画像サイズの急激な縮小を防ぎます。' } } },
            MAXPOOL2D: { name: '最大値プーリング', description: '画像の特徴を維持したまま縮小し、計算コストを削減します。', params: { kernel_size: { label: 'カーネルサイズ', description: '最大値を取得する領域の大きさです。' }, stride: { label: 'ストライド', description: 'ウィンドウを動かす歩幅。' } } },
            BATCHNORM2D: { name: 'バッチ正規化', description: '各層のデータの偏りを補正し、学習を安定・高速化させます。', params: {} },
            LSTM: { name: 'LSTM', description: '過去の情報を記憶しながら時系列データを処理する層です。', params: { hidden_size: { label: '隠れ状態のサイズ', description: '記憶セルの複雑さ（大きさ）です。' }, num_layers: { label: '層の数', description: 'LSTM層を何層重ねるか。' }, bidirectional: { label: '双方向', description: '過去から未来だけでなく、未来から過去の情報も見るか。' } } },
            GRU: { name: 'GRU', description: 'LSTMを少しシンプルにしたバージョンで、計算が速いことがあります。', params: { hidden_size: { label: '隠れ状態のサイズ', description: '記憶セルの複雑さ（大きさ）です。' }, num_layers: { label: '層の数', description: 'GRU層を何層重ねるか。' }, bidirectional: { label: '双方向', description: '過去から未来だけでなく、未来から過去の情報も見るか。' } } },
            RELU: { name: 'ReLU', description: '正の値をそのまま通し、負の値を0にする活性化関数です。', params: {} },
            SIGMOID: { name: 'シグモイド', description: '値を0から1の間に押し込める活性化関数です。', params: {} },
            TANH: { name: 'Tanh', description: '値を-1から1の間に押し込める活性化関数です。', params: {} },
            DROPOUT: { name: 'ドロップアウト', description: '学習中にランダムにニューロンを無効化することで、過学習を防ぎます。', params: { p: { label: '確率 (p)', description: '各ニューロンが無効化される確率です。通常0.2から0.5の値が使われます。' } } },
            SOFTMAX: { name: 'ソフトマックス', description: 'モデルの出力を合計1の確率分布に変換します。多クラス分類の最終層で使われます。', params: {} },
            IDENTITY: { name: '恒等関数', description: '入力をそのまま出力します。回帰問題やモデルの生の出力を得たい場合に使用します。', params: {} },
        },
        properties: {
            title: 'プロパティ',
            noLayerSelected: 'レイヤー未選択',
            noLayerSelectedHint: 'キャンバス上のレイヤーをクリックしてプロパティを表示します。',
            noParameters: 'このレイヤーに設定可能なパラメータはありません。',
            shapeInfo: '形状情報',
            inputShape: '入力形状',
            outputShape: '出力形状',
            deleteLayer: 'レイヤーを削除',
        },
        canvas: {
            empty: { title: 'ネットワークの構築を開始', subtitle: '左のライブラリからレイヤーをドラッグ＆ドロップしてください。' },
            controls: { zoomIn: 'ズームイン', zoomOut: 'ズームアウト', resetView: '表示をリセット', autoLayout: '自動整形', selectMode: '選択モード', moveMode: '移動モード' },
            disconnect: '接続を解除',
            connectionGuide: '接続したいレイヤー上でマウスを離してください',
            resetMessage: 'キャンバスがリセットされました。'
        },
        learningLab: {
            title: '学習設定ラボ',
            optimizer: 'オプティマイザ',
            optimizerType: { label: '種類', description: 'パラメータをどう更新していくかの戦略です。Adamが最も標準的で強力な選択肢の一つです。' },
            learningRate: { label: '学習率 (lr)', description: '一度にどれだけ更新するかの大きさ。大きすぎると学習が発散し、小さすぎると時間がかかりすぎます。' },
            training: '学習パラメータ',
            lossFunction: { label: '損失関数', description: 'モデルの予測と正解の「ズレ」を測るものさしです。分類問題ではCrossEntropyLossが一般的です。' },
            epochs: { label: 'エポック数', description: '訓練データを何回繰り返し学習させるか。' },
            batchSize: { label: 'バッチサイズ', description: '一度にモデルに見せるデータ数。PCのメモリ性能と相談して決めます。' },
            save: '設定を保存'
        },
        codeModal: {
            title: '生成されたPyTorchコード',
            generating: 'コードを生成中...',
            errorTitle: 'エラー',
            error: 'コードの生成に失敗しました。レイヤーの構成やパラメータを確認してください。',
            copy: 'コピー',
            close: '閉じる',
            addAiComments: 'AIでコメント追加',
            commenting: 'コメント生成中...'
        },
        validation: {
            flattenRequired: '次元エラー: 全結合層には1次元データが必要です。間にFlatten層を挿入してください。',
            convAfterDense: '次元エラー: 畳み込み層は1次元データの直後には配置できません。',
            genericError: '接続エラー: これらのレイヤーは接続できません。',
            inputFirst: '最初に「入力」レイヤーを追加してください。',
            outputLayerFinal: '出力層の後にレイヤーを追加することはできません。',
            outputLayerExists: 'エラー: 出力層はネットワークに1つしか配置できません。',
            cannotMoveInput: '入力層は移動できません。',
            inputOccupied: '接続エラー: この入力は既に使用されています。',
            outputOccupied: '接続エラー: この出力は既に使用されています。',
            cannotConnectToInput: '接続エラー: 入力層にデータを入力することはできません。',
        },
        recipes: {
            title: 'アーキテクチャ・レシピ',
            description: '一般的なネットワーク構成を選択して、設計を開始しましょう。',
            building: 'レシピからネットワークを構築中...',
            simple_cnn: {
                title: 'シンプルなCNN',
                description: 'MNISTデータセット(28x28画像)の分類に適した、シンプルな畳み込みニューラルネットワークです。'
            },
            vgg_style_cnn: {
                title: 'VGG風CNN',
                description: '複数の畳み込み層を重ねたVGGスタイルのブロックを持つ、より深いCNNモデル。複雑な画像分類に適しています。'
            },
            mlp: {
                title: 'シンプルなMLP',
                description: '基本的な多層パーセプトロン（MLP）。画像などのデータを平坦化して分類します。'
            },
            regression_mlp: {
                title: '回帰MLP',
                description: '連続した単一の値を予測（回帰）するためのMLP。出力はSoftmaxのような活性化関数を持ちません。'
            },
            simple_rnn: {
                title: 'シンプルなRNN',
                description: '平坦化されたベクトルをシーケンスとして扱う基本的な再帰型ニューラルネットワーク。'
            },
            autoencoder: {
                title: 'シンプルなオートエンコーダ',
                description: '次元削減や特徴抽出のための基本的なエンコーダ・デコーダ構造です。'
            },
        }
    },
    en: {
        header: {
            title: 'NeuroFlow',
            buttons: {
                toggleLayers: 'Toggle Layers Panel',
                toggleProperties: 'Toggle Properties Panel',
                learningLab: 'Learning Lab',
                generateCode: 'Generate Code',
                recipes: 'Recipes',
                reset: 'Reset'
            }
        },
        common: {
            cancel: 'Cancel',
            true: 'True',
            false: 'False',
            build: 'Build'
        },
        confirm: {
            reset: 'Are you sure you want to reset the canvas? Your current network will be lost.',
            buildRecipe: 'This will clear the current network and build the selected recipe. Are you sure?'
        },
        layerLibrary: {
            title: 'Layers'
        },
        categories: {
            Core: 'Core',
            CNN: 'CNN',
            RNN: 'RNN',
            Activation: 'Activation',
            Regularization: 'Regularization',
            Output: 'Output',
        },
        layers: {
            INPUT: { name: 'Input', description: 'Defines the shape of the input data.', params: { shape: { label: 'Shape', description: 'E.g., (3, 224, 224) means a 3-channel (color) 224x224 pixel image.' } } },
            LINEAR: { name: 'Linear', description: 'A fully connected layer where all neurons are connected to all neurons in the next layer.', params: { out_features: { label: 'Output Features', description: 'The number of neurons. Often used at the final layer for the number of classes.' } } },
            FLATTEN: { name: 'Flatten', description: 'Flattens multi-dimensional data into a single-dimensional vector for dense layers.', params: {} },
            CONV2D: { name: 'Conv2D', description: 'Extracts spatial features from an image, like edges.', params: { out_channels: { label: 'Output Channels', description: 'Number of filters to learn, determining the number of feature types to extract.' }, kernel_size: { label: 'Kernel Size', description: 'The size of the "magnifying glass" used for feature extraction.' }, stride: { label: 'Stride', description: 'The step size of the "magnifying glass". Larger values reduce the image size faster.' }, padding: { label: 'Padding', description: 'Adds a border of zeros to prevent rapid shrinking of the image size.' } } },
            MAXPOOL2D: { name: 'MaxPool2D', description: 'Downsamples the image while retaining important features, reducing computational cost.', params: { kernel_size: { label: 'Kernel Size', description: 'The size of the window to take the maximum value from.' }, stride: { label: 'Stride', description: 'The step size of the window.' } } },
            BATCHNORM2D: { name: 'BatchNorm2D', description: 'Normalizes data in each layer to stabilize and accelerate learning.', params: {} },
            LSTM: { name: 'LSTM', description: 'A layer for processing sequential data while retaining past information.', params: { hidden_size: { label: 'Hidden Size', description: 'The complexity (size) of the memory cell.' }, num_layers: { label: 'Num Layers', description: 'How many LSTM layers to stack.' }, bidirectional: { label: 'Bidirectional', description: 'Whether to process information from the future to the past as well.' } } },
            GRU: { name: 'GRU', description: 'A slightly simpler and often faster version of LSTM.', params: { hidden_size: { label: 'Hidden Size', description: 'The complexity (size) of the memory cell.' }, num_layers: { label: 'Num Layers', description: 'How many GRU layers to stack.' }, bidirectional: { label: 'Bidirectional', description: 'Whether to process information from the future to the past as well.' } } },
            RELU: { name: 'ReLU', description: 'An activation function that passes positive values and sets negative values to zero.', params: {} },
            SIGMOID: { name: 'Sigmoid', description: 'An activation function that squashes values to a range between 0 and 1.', params: {} },
            TANH: { name: 'Tanh', description: 'An activation function that squashes values to a range between -1 and 1.', params: {} },
            DROPOUT: { name: 'Dropout', description: 'Randomly zeroes some of the elements of the input tensor during training to prevent overfitting.', params: { p: { label: 'Probability (p)', description: 'The probability of an element to be zeroed. Usually between 0.2 and 0.5.'} } },
            SOFTMAX: { name: 'Softmax', description: 'Converts logits into probabilities that sum to 1. Used as the last layer in multi-class classification.', params: {} },
            IDENTITY: { name: 'Identity', description: 'A placeholder layer that returns its input. Useful for regression tasks or getting raw logits.', params: {} },
        },
        properties: {
            title: 'Properties',
            noLayerSelected: 'No Layer Selected',
            noLayerSelectedHint: 'Click on a layer in the canvas to see its properties.',
            noParameters: 'This layer has no configurable parameters.',
            shapeInfo: 'Shape Information',
            inputShape: 'Input Shape',
            outputShape: 'Output Shape',
            deleteLayer: 'Delete Layer',
        },
        canvas: {
            empty: { title: 'Start building your network', subtitle: 'Drag and drop layers from the library.' },
            controls: { zoomIn: 'Zoom In', zoomOut: 'Zoom Out', resetView: 'Reset View', autoLayout: 'Auto Layout', selectMode: 'Select Mode', moveMode: 'Move Mode' },
            disconnect: 'Disconnect',
            connectionGuide: 'Release to connect to the highlighted layer',
            resetMessage: 'Canvas has been reset.'
        },
        learningLab: {
            title: 'The Learning Lab',
            optimizer: 'Optimizer',
            optimizerType: { label: 'Type', description: 'The strategy for updating parameters. Adam is one of the most standard and powerful choices.' },
            learningRate: { label: 'Learning Rate (lr)', description: 'The step size for updates. Too large can cause divergence, too small can be slow.' },
            training: 'Training Parameters',
            lossFunction: { label: 'Loss Function', description: 'A ruler to measure the "error" between model predictions and the truth. CrossEntropyLoss is common for classification.' },
            epochs: { label: 'Epochs', description: 'How many times the entire training dataset is passed through the model.' },
            batchSize: { label: 'Batch Size', description: 'The number of data samples shown to the model at once. Limited by PC memory.' },
            save: 'Save Configuration'
        },
        codeModal: {
            title: 'Generated PyTorch Code',
            generating: 'Generating Code...',
            errorTitle: 'Error',
            error: 'Failed to generate code. Please check your layer configuration and parameters.',
            copy: 'Copy',
            close: 'Close',
            addAiComments: 'Add AI Comments',
            commenting: 'Commenting...'
        },
        validation: {
            flattenRequired: 'Dimension Error: A Linear layer requires 1D data. Please insert a Flatten layer first.',
            convAfterDense: 'Dimension Error: A convolution layer cannot be placed after 1D data.',
            genericError: 'Connection Error: These layers cannot be connected.',
            inputFirst: 'Please add an "Input" layer first.',
            outputLayerFinal: 'Cannot add a layer after an output layer.',
            outputLayerExists: 'Error: Only one output layer can be placed in the network.',
            cannotMoveInput: 'The Input layer cannot be moved.',
            inputOccupied: 'Connection Error: This input is already occupied.',
            outputOccupied: 'Connection Error: This output is already occupied.',
            cannotConnectToInput: 'Connection Error: Cannot connect to an Input layer.',
        },
        recipes: {
            title: 'Architecture Recipes',
            description: 'Select a common architecture to get started with your design.',
            building: 'Building network from recipe...',
            simple_cnn: {
                title: 'Simple CNN',
                description: 'A simple Convolutional Neural Network, suitable for classifying MNIST datasets (28x28 images).'
            },
            vgg_style_cnn: {
                title: 'VGG-style CNN',
                description: 'A deeper CNN with VGG-style blocks (Conv-Conv-Pool), suitable for more complex image classification.'
            },
            mlp: {
                title: 'Simple MLP',
                description: 'A basic Multi-Layer Perceptron (MLP). Flattens and classifies data like images.'
            },
            regression_mlp: {
                title: 'Regression MLP',
                description: 'An MLP for predicting a single continuous value (regression). The output is a single neuron without an activation like Softmax.'
            },
            simple_rnn: {
                title: 'Simple RNN',
                description: 'A basic Recurrent Neural Network that treats a flattened vector as a sequence.'
            },
            autoencoder: {
                title: 'Simple Autoencoder',
                description: 'A basic encoder-decoder structure for dimensionality reduction or feature extraction.'
            },
        }
    }
};

type TranslationKey = string;

export interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useTranslation = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
