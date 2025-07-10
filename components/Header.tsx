
import React from 'react';
import { useTranslation } from '../i18n';
import { useTheme } from '../index';
import { LogoIcon, PanelLeftIcon, PanelRightIcon, LabIcon, CodeIcon, BookOpenIcon, RotateCcwIcon, SunIcon, MoonIcon } from './icons';

interface HeaderProps {
    onToggleLayers: () => void;
    onToggleProperties: () => void;
    onOpenLearningLab: () => void;
    onGenerateCode: () => void;
    onToggleRecipes: () => void;
    onReset: () => void;
    isLayersOpen: boolean;
    isPropertiesOpen: boolean;
    isRecipesOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleLayers, onToggleProperties, onOpenLearningLab, onGenerateCode, onToggleRecipes, onReset, isLayersOpen, isPropertiesOpen, isRecipesOpen }) => {
    const { t, language, setLanguage } = useTranslation();
    const { theme, setTheme } = useTheme();

    const NavButton: React.FC<{onClick: () => void, title: string, isActive?: boolean, children: React.ReactNode}> = ({onClick, title, isActive, children}) => (
        <button
            onClick={onClick}
            title={title}
            className={`p-2 rounded-md transition-colors duration-200 ${isActive ? 'bg-[--color-primary]/20 text-[--color-primary]' : 'text-[--color-text-secondary] hover:bg-[--color-border] hover:text-[--color-text]'}`}
        >
            {children}
        </button>
    );

    return (
        <header className="flex items-center justify-between p-2 border-b border-[--color-border] bg-[--color-bg-secondary]/50 backdrop-blur-sm shadow-md flex-shrink-0 z-40">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[--color-text]">
                    <LogoIcon className="h-8 w-8 text-[--color-primary]" />
                    <h1 className="text-xl font-bold tracking-wider">
                        {t('header.title')}
                    </h1>
                </div>
                 <div className="flex items-center gap-2">
                    <NavButton onClick={onToggleLayers} title={t('header.buttons.toggleLayers')} isActive={isLayersOpen}>
                        <PanelLeftIcon className="h-5 w-5" />
                    </NavButton>
                    <NavButton onClick={onToggleProperties} title={t('header.buttons.toggleProperties')} isActive={isPropertiesOpen}>
                        <PanelRightIcon className="h-5 w-5" />
                    </NavButton>
                     <NavButton onClick={onToggleRecipes} title={t('header.buttons.recipes')} isActive={isRecipesOpen}>
                        <BookOpenIcon className="h-5 w-5" />
                    </NavButton>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 <div className="flex items-center bg-[--color-bg] rounded-lg p-1 border border-[--color-border]">
                    <button onClick={() => setLanguage('ja')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'ja' ? 'bg-[--color-primary] text-white' : 'text-[--color-text] hover:bg-[--color-border]'}`}>JP</button>
                    <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-[--color-primary] text-white' : 'text-[--color-text] hover:bg-[--color-border]'}`}>EN</button>
                </div>
                 <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-lg text-[--color-text-secondary] hover:text-[--color-primary] hover:bg-[--color-border] transition-colors"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </button>
                 <button
                    onClick={onReset}
                    title={t('header.buttons.reset')}
                    className="flex items-center gap-2 px-4 py-2 bg-transparent text-[--color-text-secondary] rounded-lg border border-[--color-border] hover:bg-[--color-red] hover:text-white hover:border-[--color-red] transition-colors duration-200 font-semibold shadow-sm text-sm"
                >
                    <RotateCcwIcon className="h-4 w-4" />
                    {t('header.buttons.reset')}
                </button>
                <button
                    onClick={onOpenLearningLab}
                    className="flex items-center gap-2 px-4 py-2 bg-[--color-accent] text-white rounded-lg hover:bg-[--color-accent-hover] transition-colors duration-200 font-semibold shadow-sm text-sm"
                >
                    <LabIcon className="h-5 w-5" />
                    {t('header.buttons.learningLab')}
                </button>
                <button
                    onClick={onGenerateCode}
                    className="flex items-center gap-2 px-4 py-2 bg-[--color-primary] text-white rounded-lg hover:bg-[--color-primary-hover] transition-colors duration-200 font-semibold shadow-sm text-sm"
                >
                    <CodeIcon className="h-5 w-5" />
                    {t('header.buttons.generateCode')}
                </button>
            </div>
        </header>
    );
};

export default Header;