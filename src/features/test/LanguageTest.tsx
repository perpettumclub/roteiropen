import { useTranslation } from 'react-i18next';

/**
 * Componente de TESTE para verificar se i18n está funcionando
 * 
 * Acesse: http://localhost:5555/test
 * Teste: ?lng=en ou ?lng=pt na URL
 */
export function LanguageTest() {
    const { t, i18n } = useTranslation();

    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>🌍 i18n Test Page</h1>

            <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <p><strong>Current Language:</strong> {i18n.language}</p>
                <p><strong>Resolved Language:</strong> {i18n.resolvedLanguage}</p>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h2>Manual Language Switcher</h2>
                <button
                    onClick={() => i18n.changeLanguage('en')}
                    style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}
                >
                    Switch to English
                </button>
                <button
                    onClick={() => i18n.changeLanguage('pt')}
                    style={{ padding: '10px 20px', cursor: 'pointer' }}
                >
                    Mudar para Português
                </button>
            </div>

            <hr />

            <div style={{ marginTop: '30px' }}>
                <h2>Translation Test</h2>

                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    <h3>{t('hero.title')}</h3>
                    <p>{t('hero.subtitle')}</p>
                    <button style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}>
                        {t('hero.cta')}
                    </button>
                </div>

                <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    <h3>{t('paywall.title')}</h3>
                    <p>{t('paywall.subtitle')}</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{t('paywall.price_us')}</p>
                    <ul>
                        <li>{t('paywall.features.unlimited')}</li>
                        <li>{t('paywall.features.hooks')}</li>
                        <li>{t('paywall.features.remix')}</li>
                    </ul>
                </div>

                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
                    <h3>{t('dashboard.welcome', { name: 'João' })}</h3>
                    <p>{t('dashboard.streak', { count: 7 })}</p>
                    <p>{t('dashboard.level', { level: 5 })}</p>
                </div>
            </div>

            <hr style={{ margin: '40px 0' }} />

            <div>
                <h2>Debug Info</h2>
                <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', overflow: 'auto' }}>
                    {JSON.stringify({
                        language: i18n.language,
                        resolvedLanguage: i18n.resolvedLanguage,
                        languages: i18n.languages,
                        options: {
                            fallbackLng: i18n.options.fallbackLng,
                            detection: i18n.options.detection
                        }
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
}
