
import React from 'react';
import { LAYER_DEFINITIONS } from '../constants';
import { LayerType, type LayerDefinition } from '../types';
import { BrainCircuitIcon, CloseIcon } from './icons';
import { useTranslation } from '../i18n';

interface LayerLibraryProps {
    onAddNode: (type: LayerType) => void;
    isOpen: boolean;
    onClose: () => void;
}

interface LayerItemProps {
    def: LayerDefinition;
    onClick: () => void;
    onDragStart: (e: React.DragEvent) => void;
    name: string;
    description: string;
}

const LayerItem: React.FC<LayerItemProps> = ({ onClick, onDragStart, name, description }) => {
    return (
        <button
            onClick={onClick}
            draggable="true"
            onDragStart={onDragStart}
            className="flex flex-col items-center justify-center p-2 text-center bg-[--color-bg-secondary] border border-[--color-border] rounded-lg hover:bg-[--color-primary] hover:text-white transition-all duration-200 transform hover:scale-105 shadow-md group"
            title={description}
        >
            <BrainCircuitIcon className="h-5 w-5 mb-1 text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-xs font-semibold leading-tight">{name}</span>
        </button>
    );
};

const LayerLibrary: React.FC<LayerLibraryProps> = ({ onAddNode, isOpen, onClose }) => {
    const { t } = useTranslation();
    const categories = ['Core', 'CNN', 'RNN', 'Activation', 'Regularization', 'Output'];
    const groupedLayers = categories.map(category => ({
        category,
        layers: LAYER_DEFINITIONS.filter(def => def.category === category)
    })).filter(group => group.layers.length > 0);

    const handleDragStart = (e: React.DragEvent, type: LayerType) => {
        e.dataTransfer.setData('layerType', type);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <aside className={`absolute top-0 left-0 h-full bg-[--color-bg-secondary]/80 backdrop-blur-md border-r border-[--color-border] shadow-2xl z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{width: '280px'}}>
             <div className="flex justify-between items-center p-4 border-b border-[--color-border]">
                <h2 className="text-lg font-bold text-white">{t('layerLibrary.title')}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
                {groupedLayers.map(({ category, layers }) => (
                    <div key={category} className="mb-6">
                        <h3 className="text-sm font-semibold text-[--color-primary] mb-3 uppercase tracking-wider">{t(`categories.${category}`)}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {layers.map(def => (
                                def.type !== LayerType.INPUT && (
                                    <LayerItem
                                        key={def.type}
                                        def={def}
                                        name={t(`layers.${def.type}.name`)}
                                        description={t(`layers.${def.type}.description`)}
                                        onClick={() => onAddNode(def.type)}
                                        onDragStart={(e) => handleDragStart(e, def.type)}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default LayerLibrary;
