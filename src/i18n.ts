import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import pt from './locales/pt.json';

i18n
    // Detecta idioma automaticamente do navegador
    .use(LanguageDetector)
    // Integra com React
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            pt: { translation: pt }
        },
        // Idioma padrão se não detectar
        fallbackLng: 'en',

        // Detecção automática por ordem de prioridade:
        detection: {
            order: ['querystring', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage'],
        },

        interpolation: {
            escapeValue: false // React já protege contra XSS
        }
    });

export default i18n;
