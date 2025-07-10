
import React, { useState, useCallback, FC, ReactNode, createContext, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageContext, translations, type Language } from './i18n';

type Theme = 'light' | 'dark';

export const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void; } | undefined>(undefined);

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const root = window.document.documentElement;
        root.dataset.theme = theme;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('ja');

    const t = useCallback((key: string): string => {
        const langDict = translations[language];
        const keys = key.split('.');
        let result: any = langDict;
        
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) {
                // Fallback to English for better stability
                let fallbackResult: any = translations.en;
                for (const fk of keys) {
                    fallbackResult = fallbackResult?.[fk];
                }
                return fallbackResult || key;
            }
        }
        return typeof result === 'string' ? result : key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);