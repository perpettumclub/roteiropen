import { useTranslation } from 'react-i18next';

/**
 * EXEMPLO: Como usar i18n em um componente
 * 
 * Este é um exemplo educacional mostrando como refatorar
 * componentes existentes para suportar múltiplos idiomas.
 */

// ❌ ANTES (hard-coded em Português)
export function HeroBeforeExample() {
    return (
        <div>
            <h1>Transforme Áudios em Roteiros Virais</h1>
            <p>Framework de 6 Atos com IA</p>
            <button>Começar Agora</button>
        </div>
    );
}

// ✅ DEPOIS (com i18n)
export function HeroAfterExample() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('hero.title')}</h1>
            <p>{t('hero.subtitle')}</p>
            <button>{t('hero.cta')}</button>
        </div>
    );
}

// ✅ EXEMPLO: Interpolação de variáveis
export function WelcomeExample() {
    const { t } = useTranslation();
    const userName = "João";

    return (
        <div>
            {/* Em pt.json: "welcome": "Bem-vindo de volta, {{name}}!" */}
            {/* Em en.json: "welcome": "Welcome back, {{name}}!" */}
            <h2>{t('dashboard.welcome', { name: userName })}</h2>
        </div>
    );
}

// ✅ EXEMPLO: Plural/Contador
export function StreakExample() {
    const { t } = useTranslation();
    const streakCount = 7;

    return (
        <div>
            {/* Mostra: "Ofensiva de 7 dias! 🔥" em PT */}
            {/* Mostra: "7-day streak! 🔥" em EN */}
            <p>{t('dashboard.streak', { count: streakCount })}</p>
        </div>
    );
}

// ✅ EXEMPLO: Trocar idioma manualmente
export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div>
            <button onClick={() => changeLanguage('en')}>English</button>
            <button onClick={() => changeLanguage('pt')}>Português</button>

            {/* Idioma atual */}
            <p>Current: {i18n.language}</p>
        </div>
    );
}
