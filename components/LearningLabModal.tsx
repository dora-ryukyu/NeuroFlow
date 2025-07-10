
import React, { useState } from 'react';
import { type TrainingConfig } from '../types';
import { CloseIcon, LabIcon, InfoIcon } from './icons';
import { useTranslation } from '../i18n';

interface LearningLabModalProps {
    config: TrainingConfig;
    onSave: (newConfig: TrainingConfig) => void;
    onClose: () => void;
}

const LearningLabModal: React.FC<LearningLabModalProps> = ({ config, onSave, onClose }) => {
    const { t } = useTranslation();
    const [currentConfig, setCurrentConfig] = useState<TrainingConfig>(config);

    const handleSave = () => {
        onSave(currentConfig);
        onClose();
    };

    const handleChange = (field: keyof TrainingConfig, value: string | number) => {
        const parsedValue = typeof currentConfig[field] === 'number' ? parseFloat(value as string) : value;
        setCurrentConfig(prev => ({ ...prev, [field]: parsedValue }));
    };

    const InputField = ({ id, label, description, children }: { id: string, label: string, description: string, children: React.ReactNode }) => (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-[--color-text] mb-1 flex items-center">
                {label}
                <div className="relative group ml-2">
                    <InfoIcon className="h-4 w-4 text-[--color-text-secondary] cursor-pointer" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-[--color-bg] border border-[--color-border] text-[--color-text] text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {description}
                    </div>
                </div>
            </label>
            {children}
        </div>
    );
    const inputClasses = "w-full bg-[--color-bg-secondary] border border-[--color-border] rounded-md py-2 px-3 text-[--color-text] focus:outline-none focus:ring-[--color-primary] focus:border-[--color-primary]";

    return (
        <div className="fixed inset-0 bg-[--color-modal-overlay] flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[--color-bg] border border-[--color-border] rounded-lg shadow-2xl w-full max-w-lg m-4">
                <div className="flex items-center justify-between p-4 border-b border-[--color-border]">
                    <div className="flex items-center gap-3">
                        <LabIcon className="h-6 w-6 text-[--color-accent-light]" />
                        <h2 className="text-xl font-bold text-[--color-text]">{t('learningLab.title')}</h2>
                    </div>
                    <button onClick={onClose} className="text-[--color-text-secondary] hover:text-[--color-text]">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[--color-accent-light] mb-3">{t('learningLab.optimizer')}</h3>
                            <InputField id="optimizer" label={t('learningLab.optimizerType.label')} description={t('learningLab.optimizerType.description')}>
                                <select id="optimizer" value={currentConfig.optimizer} onChange={(e) => handleChange('optimizer', e.target.value)} className={inputClasses}>
                                    <option>Adam</option>
                                    <option>SGD</option>
                                </select>
                            </InputField>
                            <InputField id="learningRate" label={t('learningLab.learningRate.label')} description={t('learningLab.learningRate.description')}>
                                <input id="learningRate" type="number" step="0.0001" value={currentConfig.learningRate} onChange={(e) => handleChange('learningRate', e.target.value)} className={inputClasses} />
                            </InputField>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[--color-accent-light] mb-3">{t('learningLab.training')}</h3>
                             <InputField id="lossFunction" label={t('learningLab.lossFunction.label')} description={t('learningLab.lossFunction.description')}>
                                <select id="lossFunction" value={currentConfig.lossFunction} onChange={(e) => handleChange('lossFunction', e.target.value)} className={inputClasses}>
                                    <option>CrossEntropyLoss</option>
                                    <option>MSELoss</option>
                                </select>
                            </InputField>
                            <InputField id="epochs" label={t('learningLab.epochs.label')} description={t('learningLab.epochs.description')}>
                                <input id="epochs" type="number" value={currentConfig.epochs} onChange={(e) => handleChange('epochs', e.target.value)} className={inputClasses} />
                            </InputField>
                            <InputField id="batchSize" label={t('learningLab.batchSize.label')} description={t('learningLab.batchSize.description')}>
                                <input id="batchSize" type="number" value={currentConfig.batchSize} onChange={(e) => handleChange('batchSize', e.target.value)} className={inputClasses} />
                            </InputField>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 bg-black/5 dark:bg-black/5 border-t border-[--color-border]">
                     <button onClick={onClose} className="px-6 py-2 bg-transparent text-[--color-text-secondary] rounded-lg hover:bg-[--color-border] transition-colors font-semibold mr-2">
                        {t('common.cancel')}
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-[--color-accent] text-white rounded-lg hover:bg-[--color-accent-hover] transition-colors font-semibold">
                        {t('learningLab.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LearningLabModal;