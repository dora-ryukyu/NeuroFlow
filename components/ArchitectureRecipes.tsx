
import React from 'react';
import { useTranslation } from '../i18n';
import { AiAction } from '../types';
import { CloseIcon, BookOpenIcon, WandIcon } from './icons';
import { RECIPES, Recipe } from '../recipes';

interface ArchitectureRecipesProps {
    isOpen: boolean;
    onClose: () => void;
    onBuild: (actions: AiAction[]) => void;
}

const RecipeCard: React.FC<{recipe: Recipe, onBuild: (actions: AiAction[]) => void}> = ({ recipe, onBuild }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-[--color-bg-secondary] p-4 rounded-lg border border-[--color-border] flex flex-col gap-3 transition-transform hover:scale-[1.02] hover:border-[--color-primary]/50">
            <h3 className="font-bold text-[--color-text]">{t(recipe.titleKey)}</h3>
            <p className="text-sm text-[--color-text-secondary] flex-grow">{t(recipe.descriptionKey)}</p>
            <button
                onClick={() => onBuild(recipe.actions)}
                className="w-full mt-2 px-4 py-2 bg-[--color-accent] text-white rounded-lg hover:bg-[--color-accent-hover] transition-colors duration-200 font-semibold shadow-sm text-sm flex items-center justify-center gap-2"
            >
                <WandIcon className="h-5 w-5" />
                {t('common.build')}
            </button>
        </div>
    )
}

const ArchitectureRecipes: React.FC<ArchitectureRecipesProps> = ({ isOpen, onClose, onBuild }) => {
    const { t } = useTranslation();
    
    return (
        <div className={`fixed bottom-6 right-6 bg-[--color-bg]/80 backdrop-blur-xl border border-[--color-border] rounded-xl shadow-2xl w-full max-w-md m-4 z-50 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`} style={{ height: '70vh', maxHeight: '700px'}}>
            <div className="flex items-center justify-between p-4 border-b border-[--color-border] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <BookOpenIcon className="h-6 w-6 text-[--color-primary]" />
                    <h2 className="text-xl font-bold text-[--color-text]">{t('recipes.title')}</h2>
                </div>
                <button onClick={onClose} className="text-[--color-text-secondary] hover:text-[--color-text]">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6 flex-grow overflow-y-auto">
                <p className="text-[--color-text-secondary] text-sm mb-6">{t('recipes.description')}</p>
                <div className="space-y-4">
                    {RECIPES.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} onBuild={onBuild} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ArchitectureRecipes;