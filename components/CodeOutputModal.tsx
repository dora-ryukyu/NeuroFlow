
import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, CodeIcon, CopyIcon, CheckIcon, ErrorIcon } from './icons';
import { useTranslation } from '../i18n';
import { generatePyTorchCode } from '../services/codeGenerator';
import { CanvasNodeData, TrainingConfig } from '../types';

interface CodeOutputModalProps {
    sortedNodes: CanvasNodeData[];
    trainingConfig: TrainingConfig;
    onClose: () => void;
    addToast: (message: string, type: 'error' | 'info' | 'success') => void;
}

const CodeOutputModal: React.FC<CodeOutputModalProps> = ({ sortedNodes, trainingConfig, onClose, addToast }) => {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const generateInitialCode = useCallback(() => {
        try {
            const generated = generatePyTorchCode(sortedNodes, trainingConfig);
            setCode(generated);
            setError(null);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : t('codeModal.error'));
        } finally {
            setIsLoading(false);
        }
    }, [sortedNodes, trainingConfig, t]);

    useEffect(() => {
        generateInitialCode();
    }, [generateInitialCode]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-[--color-modal-overlay] flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[--color-bg] border border-[--color-border] rounded-lg shadow-2xl w-full max-w-4xl m-4 flex flex-col" style={{ height: 'calc(100vh - 4rem)'}}>
                <div className="flex items-center justify-between p-4 border-b border-[--color-border] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <CodeIcon className="h-6 w-6 text-[--color-primary]" />
                        <h2 className="text-xl font-bold text-white">{t('codeModal.title')}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 relative flex-grow overflow-auto font-mono">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
                            <div className="w-16 h-16 border-4 border-[--color-primary] border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-lg text-[--color-text] font-sans">{t('codeModal.generating')}</p>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[--color-red]">
                            <ErrorIcon className="h-16 w-16 mb-4" />
                            <h3 className="text-xl font-semibold font-sans">{t('codeModal.errorTitle')}</h3>
                            <p className="font-sans">{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && code && (
                         <div className="relative">
                            <pre className="bg-[--color-bg-secondary] p-4 rounded-md overflow-x-auto text-sm text-[--color-text] whitespace-pre-wrap">{code}</pre>
                        </div>
                    )}
                </div>
                 <div className="flex justify-end items-center p-4 bg-black/5 dark:bg-black/5 border-t border-[--color-border] flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCopy}
                            title={t('codeModal.copy')}
                            className="p-2 bg-[--color-border] rounded-lg text-[--color-text-secondary] hover:bg-opacity-80 hover:text-[--color-text] transition-colors disabled:opacity-50"
                            disabled={isLoading || !!error}
                        >
                            {copied ? <CheckIcon className="h-5 w-5 text-[--color-green]" /> : <CopyIcon className="h-5 w-5" />}
                        </button>
                        <button onClick={onClose} className="px-6 py-2 bg-transparent text-[--color-text-secondary] rounded-lg hover:bg-[--color-border] transition-colors font-semibold">
                            {t('codeModal.close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeOutputModal;