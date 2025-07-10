
import React from 'react';
import { type CanvasNodeData, type ParameterDefinition, LayerType } from '../types';
import { ShapeInfo } from '../services/codeGenerator';
import { LAYER_MAP } from '../constants';
import { InfoIcon, TrashIcon, ErrorIcon, CloseIcon } from './icons';
import { useTranslation } from '../i18n';

interface PropertiesPanelProps {
    node: CanvasNodeData | null;
    shapeProgression: ShapeInfo[];
    onUpdateParams: (id: string, newParams: any) => void;
    onDeleteNode: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const ParameterInput: React.FC<{ nodeType: string, paramDef: ParameterDefinition, value: any, onChange: (value: any) => void }> = ({ nodeType, paramDef, value, onChange }) => {
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const val = e.target.value;
        if (paramDef.type === 'number') {
            onChange(parseFloat(val) || 0);
        } else {
            onChange(val);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    const id = `param-${paramDef.name}`;
    const label = t(`layers.${nodeType}.params.${paramDef.name}.label`);
    const description = t(`layers.${nodeType}.params.${paramDef.name}.description`);

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-[--color-text] mb-1 flex items-center">
                {label}
                <div className="relative group ml-2">
                    <InfoIcon className="h-4 w-4 text-[--color-text-secondary] cursor-pointer" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-[--color-bg] border border-[--color-border] text-[--color-text] text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {description}
                    </div>
                </div>
            </label>
            {paramDef.type === 'boolean' ? (
                 <label className="flex items-center space-x-3 cursor-pointer p-2 bg-black/10 dark:bg-black/20 rounded-md">
                    <input
                        id={id}
                        type="checkbox"
                        checked={!!value}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-500 text-[--color-primary] focus:ring-[--color-primary] bg-transparent cursor-pointer"
                    />
                     <span className="text-sm text-[--color-text]">{value ? t('common.true') : t('common.false')}</span>
                </label>
            ) : (
                <input
                    id={id}
                    type={paramDef.type === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-[--color-border] rounded-md shadow-sm py-2 px-3 text-[--color-text] focus:outline-none focus:ring-[--color-primary] focus:border-[--color-primary]"
                />
            )}
        </div>
    );
};

const ShapeDisplay: React.FC<{ shapeInfo: ShapeInfo | undefined }> = ({ shapeInfo }) => {
    const { t } = useTranslation();
    if (!shapeInfo) return null;
    const formatShape = (shape: number[] | string) => (typeof shape === 'string' ? shape : `(${shape.join(', ')})`);

    return (
        <div className="mt-6 border-t border-[--color-border] pt-4 space-y-3">
            <h3 className="text-md font-semibold text-[--color-text]">{t('properties.shapeInfo')}</h3>
            {shapeInfo.error ? (
                <div className="bg-[--color-error-bg] p-3 rounded-md text-[--color-error-text] text-sm flex items-start gap-2">
                    <ErrorIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>{shapeInfo.error}</span>
                </div>
            ) : (
                <>
                    <div>
                        <span className="font-semibold text-[--color-text-secondary]">{t('properties.inputShape')}: </span>
                        <code className="text-[--color-shape-in] bg-black/10 dark:bg-black/30 px-2 py-1 rounded-md text-xs">{formatShape(shapeInfo.inputShape)}</code>
                    </div>
                    <div>
                        <span className="font-semibold text-[--color-text-secondary]">{t('properties.outputShape')}: </span>
                        <code className="text-[--color-shape-out] bg-black/10 dark:bg-black/30 px-2 py-1 rounded-md text-xs">{formatShape(shapeInfo.outputShape)}</code>
                    </div>
                </>
            )}
        </div>
    );
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, shapeProgression, onUpdateParams, onDeleteNode, isOpen, onClose }) => {
    const { t } = useTranslation();
    const shapeInfo = node ? shapeProgression.find(p => p.nodeId === node.id) : undefined;

    return (
        <aside className={`absolute top-0 right-0 h-full bg-[--color-bg-secondary]/80 backdrop-blur-md border-l border-[--color-border] shadow-2xl z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{width: '320px'}}>
             <div className="flex justify-between items-center p-4 border-b border-[--color-border]">
                <h2 className="text-lg font-bold text-[--color-text]">{t('properties.title')}</h2>
                <button onClick={onClose} className="text-[--color-text-secondary] hover:text-[--color-text]">
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
                {!node ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-[--color-text-secondary]">
                            <p className="font-semibold">{t('properties.noLayerSelected')}</p>
                            <p className="text-sm">{t('properties.noLayerSelectedHint')}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h2 className="text-xl font-bold text-[--color-text]">{t(`layers.${node.type}.name`)}</h2>
                                <p className="text-sm text-[--color-text-secondary]">{t(`categories.${LAYER_MAP.get(node.type)?.category}`)}</p>
                            </div>
                            {node.type !== LayerType.INPUT && (
                                <button onClick={() => onDeleteNode(node.id)} className="text-[--color-text-secondary] hover:text-[--color-red] transition-colors p-2" title={t('properties.deleteLayer')}>
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-[--color-text-secondary] mb-6">{t(`layers.${node.type}.description`)}</p>
                        
                        {LAYER_MAP.get(node.type)?.params.length ?? 0 > 0 ? (
                            LAYER_MAP.get(node.type)!.params.map(paramDef => (
                                <ParameterInput
                                    key={paramDef.name}
                                    nodeType={node.type}
                                    paramDef={paramDef}
                                    value={node.params[paramDef.name]}
                                    onChange={(value) => onUpdateParams(node.id, { [paramDef.name]: value })}
                                />
                            ))
                        ) : (
                            <p className="text-[--color-text-secondary] italic">{t('properties.noParameters')}</p>
                        )}
                        
                        <ShapeDisplay shapeInfo={shapeInfo} />
                    </>
                )}
            </div>
        </aside>
    );
};

export default PropertiesPanel;