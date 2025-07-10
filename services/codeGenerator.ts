
import { type CanvasNodeData, type TrainingConfig, LayerType } from '../types';

export interface ShapeInfo {
    nodeId: string;
    inputShape: number[] | string;
    outputShape: number[] | string;
    error?: string | null;
}


/**
 * Parses a shape string like '(1, 28, 28)' into an array of numbers.
 */
export function parseShape(shapeStr: string): number[] {
    try {
        if (!shapeStr || typeof shapeStr !== 'string') throw new Error('Input shape is not a string.');
        const sanitized = shapeStr.trim().replace(/\s/g, '');
        if (!sanitized.startsWith('(') || !sanitized.endsWith(')')) {
            throw new Error('Shape must be enclosed in parentheses.');
        }
        const content = sanitized.substring(1, sanitized.length - 1);
        if (content === '') return [];

        const parsed = content.split(',').map(item => {
            const num = parseInt(item, 10);
            if (isNaN(num)) throw new Error(`Invalid number in shape: ${item}`);
            return num;
        });
        
        return parsed;
    } catch (e) {
        console.error(`Could not parse shape: ${shapeStr}`, e);
        throw new Error(`Invalid shape format: "${shapeStr}". Expected format like (C, H, W) or (features).`);
    }
}

/**
 * Calculates the input and output shape for each node in a pre-sorted graph.
 */
export function calculateShapeProgression(sortedNodes: CanvasNodeData[]): ShapeInfo[] {
    const progression: ShapeInfo[] = [];
    if (sortedNodes.length === 0 || sortedNodes[0].type !== LayerType.INPUT) {
        return [];
    }
    
    let currentShape: number[] | null = null;
    let hasError = false;

    for (const node of sortedNodes) {
        const info: ShapeInfo = { nodeId: node.id, inputShape: 'N/A', outputShape: 'N/A', error: null };
        
        if (hasError) {
            info.error = "Input shape is invalid due to a previous error.";
            progression.push(info);
            continue;
        }

        try {
            if (node.type === LayerType.INPUT) {
                currentShape = parseShape(node.params.shape);
                info.inputShape = "Start";
                info.outputShape = [...currentShape];
            } else {
                if (!currentShape) {
                    throw new Error("Cannot calculate shape, previous shape is unknown.");
                }
                info.inputShape = [...currentShape];

                switch (node.type) {
                    case LayerType.CONV2D: {
                        if (currentShape.length !== 3) throw new Error(`Requires a 3D input (C, H, W), but got ${currentShape.length}D.`);
                        const [in_channels, h_in, w_in] = currentShape;
                        const { out_channels, kernel_size, stride, padding } = node.params;
                        const h_out = Math.floor((h_in + 2 * padding - kernel_size) / stride) + 1;
                        const w_out = Math.floor((w_in + 2 * padding - kernel_size) / stride) + 1;
                        currentShape = [out_channels, h_out, w_out];
                        break;
                    }
                    case LayerType.MAXPOOL2D: {
                        if (currentShape.length !== 3) throw new Error(`Requires a 3D input, but got ${currentShape.length}D.`);
                        const { kernel_size, stride } = node.params;
                        const [channels, h_in, w_in] = currentShape;
                        const h_out = Math.floor((h_in - kernel_size) / stride) + 1;
                        const w_out = Math.floor((w_in - kernel_size) / stride) + 1;
                        currentShape = [channels, h_out, w_out];
                        break;
                    }
                    case LayerType.BATCHNORM2D: {
                        if (currentShape.length !== 3) throw new Error(`Requires a 3D input, but got ${currentShape.length}D.`);
                        // Shape does not change
                        break;
                    }
                    case LayerType.FLATTEN: {
                        if (currentShape.length === 1) { // Already flat
                            // No shape change, no error.
                        } else {
                            currentShape = [currentShape.reduce((a, b) => a * b, 1)];
                        }
                        break;
                    }
                    case LayerType.LINEAR: {
                        if (currentShape.length !== 1) throw new Error(`Requires a 1D input (features), but got ${currentShape.length}D. Add a Flatten layer.`);
                        const { out_features } = node.params;
                        currentShape = [out_features];
                        break;
                    }
                    case LayerType.LSTM:
                    case LayerType.GRU: {
                        if (currentShape.length !== 1) throw new Error(`Requires a 1D input for this simplified implementation.`);
                        const { hidden_size, bidirectional } = node.params;
                        currentShape = [bidirectional ? hidden_size * 2 : hidden_size];
                        break;
                    }
                    case LayerType.RELU:
                    case LayerType.SIGMOID:
                    case LayerType.TANH:
                    case LayerType.DROPOUT:
                    case LayerType.SOFTMAX:
                    case LayerType.IDENTITY:
                        // These layers do not change the shape
                        break;
                    default:
                        // This should not happen if all layer types are handled
                        break;
                }
                info.outputShape = [...currentShape];
            }
        } catch (e) {
            info.error = e instanceof Error ? e.message : 'Unknown shape error.';
            hasError = true;
            currentShape = null;
        }
        progression.push(info);
    }
    return progression;
}


/**
 * Generates a complete, professional PyTorch script from sorted nodes.
 */
export function generatePyTorchCode(sortedNodes: CanvasNodeData[], config: TrainingConfig): string {
    if (sortedNodes.length === 0 || sortedNodes[0].type !== LayerType.INPUT) {
        throw new Error("The model must start with an Input layer.");
    }
    
    const shapeProgression = calculateShapeProgression(sortedNodes);
    const finalProgressionState = shapeProgression[shapeProgression.length - 1];
    if (finalProgressionState?.error) {
        const errorNode = sortedNodes.find(n => n.id === finalProgressionState.nodeId);
        throw new Error(`Cannot generate code due to a shape error on layer '${errorNode?.name}': ${finalProgressionState.error}`);
    }

    const finalOutputShape = finalProgressionState.outputShape;
    if (typeof finalOutputShape === 'string' || !Array.isArray(finalOutputShape) || finalOutputShape.length === 0) {
        throw new Error('Could not determine a valid, non-empty final output shape for the model.');
    }
    const classificationOutputSize = finalOutputShape[finalOutputShape.length - 1];
    const finalOutputShapeTupleString = `(${finalOutputShape.join(', ')}${finalOutputShape.length === 1 ? ',' : ''})`;


    const layerStrings: string[] = [];
    let softmaxOmittedForCELoss = false;
    
    // Start from index 1 to skip the Input node
    for (let i = 1; i < sortedNodes.length; i++) {
        const node = sortedNodes[i];
        const layerVarName = `layer_${node.id.replace(/-/g, '_')}`;

        if (node.type === LayerType.SOFTMAX && config.lossFunction === 'CrossEntropyLoss') {
            softmaxOmittedForCELoss = true;
            continue;
        }

        const progress = shapeProgression.find(p => p.nodeId === node.id);
        if (!progress || !progress.inputShape || typeof progress.inputShape === 'string' || !Array.isArray(progress.inputShape)) {
             throw new Error(`Could not determine input shape for layer ${node.name} (ID: ${node.id})`);
        }
        const in_shape = progress.inputShape;
        let layerString = '';

        switch (node.type) {
            case LayerType.CONV2D:
                layerString = `nn.Conv2d(in_channels=${in_shape[0]}, out_channels=${node.params.out_channels}, kernel_size=${node.params.kernel_size}, stride=${node.params.stride}, padding=${node.params.padding})`;
                break;
            case LayerType.MAXPOOL2D:
                layerString = `nn.MaxPool2d(kernel_size=${node.params.kernel_size}, stride=${node.params.stride})`;
                break;
            case LayerType.BATCHNORM2D:
                layerString = `nn.BatchNorm2d(num_features=${in_shape[0]})`;
                break;
            case LayerType.FLATTEN:
                layerString = `nn.Flatten(start_dim=1)`;
                break;
            case LayerType.LINEAR:
                layerString = `nn.Linear(in_features=${in_shape[0]}, out_features=${node.params.out_features})`;
                break;
            case LayerType.RELU: layerString = `nn.ReLU()`; break;
            case LayerType.SIGMOID: layerString = `nn.Sigmoid()`; break;
            case LayerType.TANH: layerString = `nn.Tanh()`; break;
            case LayerType.DROPOUT: layerString = `nn.Dropout(p=${node.params.p})`; break;
            case LayerType.SOFTMAX: layerString = `nn.Softmax(dim=1)`; break;
            case LayerType.IDENTITY: layerString = `nn.Identity()`; break;
            case LayerType.LSTM:
            case LayerType.GRU:
                layerString = `nn.${node.type}(input_size=${in_shape[0]}, hidden_size=${node.params.hidden_size}, num_layers=${node.params.num_layers}, batch_first=True, bidirectional=${node.params.bidirectional})`;
                break;
            default: continue;
        }
        layerStrings.push(`            # ${node.name}\n            self.${layerVarName} = ${layerString}`);
    }

    const forwardStrings = sortedNodes.slice(1).map((node) => {
        const layerVarName = `layer_${node.id.replace(/-/g, '_')}`;

        if (node.type === LayerType.SOFTMAX && config.lossFunction === 'CrossEntropyLoss') {
            return null; // Skip forward pass for omitted softmax
        }

        let pass = `x = self.${layerVarName}(x)`;
        if (node.type === LayerType.LSTM || node.type === LayerType.GRU) {
             pass = `x, _ = self.${layerVarName}(x)  # We only need the output sequence`;
        }
        return pass;
    }).filter(Boolean);


    const initComment = softmaxOmittedForCELoss
        ? `\n        # NOTE: The final nn.Softmax layer is omitted because nn.CrossEntropyLoss\n        #       combines LogSoftmax and NLLLoss in one class for better stability.`
        : '';
    
    const modelDefinition = `
class NeuroFlowModel(nn.Module):
    """
    Neural network model designed with NeuroFlow.
    Input shape: ${sortedNodes[0].params.shape}
    """
    def __init__(self):
        super(NeuroFlowModel, self).__init__()
${layerStrings.join('\n\n')}
${initComment}

    def forward(self, x):
${forwardStrings.map(s => '        ' + s).join('\n')}
        return x
`;

    const fullScript = `
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# ------------------- Model Definition -------------------
${modelDefinition}

# ------------------- Utility Functions -------------------
def count_parameters(model):
    """Counts the number of trainable parameters in a model."""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

# ------------------- Main Training/Evaluation Logic -------------------
def train_epoch(model, dataloader, criterion, optimizer, device):
    """Main training loop for one epoch."""
    model.train()  # Set model to training mode
    running_loss = 0.0
    for i, (inputs, labels) in enumerate(dataloader):
        inputs, labels = inputs.to(device), labels.to(device)

        # Zero the parameter gradients
        optimizer.zero_grad()

        # Forward pass
        outputs = model(inputs)
        loss = criterion(outputs, labels)

        # Backward pass and optimize
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
    
    avg_loss = running_loss / len(dataloader)
    print(f"  Training Loss: {avg_loss:.4f}")

def evaluate_epoch(model, dataloader, criterion, device):
    """Main evaluation loop for one epoch."""
    model.eval()  # Set model to evaluation mode
    running_loss = 0.0
    correct_predictions = 0
    total_samples = 0
    
    with torch.no_grad():  # Disable gradient calculations
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            running_loss += loss.item()
            
            # Calculate accuracy for classification tasks
            if isinstance(criterion, (nn.CrossEntropyLoss, nn.NLLLoss)):
                _, predicted = torch.max(outputs.data, 1)
                total_samples += labels.size(0)
                correct_predictions += (predicted == labels).sum().item()

    avg_loss = running_loss / len(dataloader)
    accuracy = (correct_predictions / total_samples) * 100 if total_samples > 0 else 0.0
    
    print(f"  Validation Loss: {avg_loss:.4f}" + (f", Accuracy: {accuracy:.2f}%" if accuracy > 0 else ""))


# ------------------- Main Execution -------------------
if __name__ == '__main__':
    # --- Configuration ---
    EPOCHS = ${config.epochs}
    BATCH_SIZE = ${config.batchSize}
    LEARNING_RATE = ${config.learningRate}

    # --- Setup Device ---
    # Use GPU if available, otherwise fall back to CPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # --- Setup Model ---
    model = NeuroFlowModel().to(device)
    print("\\n--- Model Architecture ---")
    print(model)
    print(f"\\nTotal Trainable Parameters: {count_parameters(model):,}")
    print("--------------------------\\n")

    # --- Create Placeholder Data ---
    # IMPORTANT: Replace this with your actual data loading logic.
    # This code creates random tensors for demonstration purposes.
    print("Creating placeholder data loaders (replace with your actual data)...")
    
    # Safely create the input shape tuple to handle single-element tuples correctly
    input_shape_tuple = (${parseShape(sortedNodes[0].params.shape).join(', ')}${parseShape(sortedNodes[0].params.shape).length === 1 ? ',' : ''})
    
    sample_input_shape = (BATCH_SIZE,) + input_shape_tuple
    
    placeholder_inputs = torch.randn(*sample_input_shape)
    
    output_shape = ${finalOutputShapeTupleString}

    if '${config.lossFunction}' == 'CrossEntropyLoss':
        # For classification, labels should be class indices (LongTensor)
        # We assume the last dimension of the output shape is the number of classes.
        num_classes = ${classificationOutputSize}
        placeholder_targets = torch.randint(0, num_classes, (BATCH_SIZE,))
    else: # e.g., MSELoss for regression
        # For regression, targets should be floats matching the full output shape
        placeholder_targets = torch.randn(BATCH_SIZE, *output_shape)

    # Create a Dataset and DataLoader
    # Use this structure for both your training and validation data
    placeholder_dataset = TensorDataset(placeholder_inputs, placeholder_targets)
    # In a real scenario, you'd have a train_loader and a val_loader
    train_loader = DataLoader(placeholder_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(placeholder_dataset, batch_size=BATCH_SIZE) # No shuffle for validation
    print("Placeholder data created.\\n")
    # --- End of Placeholder Data Section ---

    # --- Setup Optimizer and Loss Function ---
    optimizer = optim.${config.optimizer}(model.parameters(), lr=LEARNING_RATE)
    criterion = nn.${config.lossFunction}()

    # --- Training Loop ---
    print("--- Starting Training ---")
    for epoch in range(1, EPOCHS + 1):
        print(f"Epoch {epoch}/{EPOCHS}:")
        train_epoch(model, train_loader, criterion, optimizer, device)
        evaluate_epoch(model, val_loader, criterion, device)
        print("-" * 25)
        
    print("Finished Training.")
`;

    return fullScript.trim();
}
