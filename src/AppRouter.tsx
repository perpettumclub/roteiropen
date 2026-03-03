import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';

// Features
import { CheckoutScreen, Paywall } from './features/billing';
import { Dashboard, ScriptLibrary, ProgressScreen } from './features/dashboard';
import { LoginScreen, SignUpScreen, ForgotPasswordScreen, useAuth } from './features/auth';
import { LanguageTest } from './features/test';

// Pages
import { LandingPage } from './pages/LandingPage';
import { QuizPage } from './pages/QuizPage';
import { SalesPaywallPage } from './pages/SalesPaywallPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { RecorderPage } from './pages/RecorderPage';
import { AudioProcessingPage } from './pages/AudioProcessingPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { RemixPage } from './pages/RemixPage';
import { ScriptGenerationPage } from './pages/ScriptGenerationPage';
import { ResultPage } from './pages/ResultPage';
import { SharePage } from './pages/SharePage';

import { ChallengeVSL } from './pages/ChallengeVSL';

// Shared
import { StreakDisplay, BadgeNotification, useUser } from './shared';
import { useSubscription } from './hooks/useSubscription';

import { PLAN_PRICE_BRL, ROUTES } from './shared/constants';

// --- Guards ---

const RequireAuth = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Carregando...</div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

const RequireSubscription = () => {
    const { isPremium, freeScriptsRemaining } = useUser();

    // Sem bypass de quiz — acesso exige assinatura ou scripts reais
    const canAccess = isPremium || freeScriptsRemaining > 0;

    if (!canAccess) {
        return <Navigate to="/paywall" replace />;
    }

    return <Outlet />;
};

// --- Layouts ---

const PublicLayout = () => {
    return (
        <div className="app-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative'
        }}>
            <div className="bg-noise" />
            <div className="blob" style={{ top: '-10%', left: '-10%', width: '500px', height: '500px', background: '#FFEFBA' }} />
            <div className="blob" style={{ bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: '#FFE66D', animationDelay: '2s' }} />

            <Outlet />
        </div>
    );
};

const AppLayout = () => {
    const { currentStreak, freeScriptsRemaining, isPremium } = useUser();
    const { subscription, daysRemaining } = useSubscription();

    const isTrial = subscription?.status === 'trialing';
    const trialDaysLeft = isTrial ? Math.max(0, daysRemaining) : undefined;

    return (
        <div className="app-container" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            position: 'relative'
        }}>
            <StreakDisplay
                currentStreak={currentStreak}
                scriptsRemaining={freeScriptsRemaining}
                isPremium={isPremium}
                subscriptionStatus={subscription?.status}
                trialDaysLeft={trialDaysLeft}
            />

            <div className="bg-noise" />
            <div className="blob" style={{ top: '-10%', left: '-10%', width: '500px', height: '500px', background: '#FFEFBA' }} />
            <div className="blob" style={{ bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: '#FFE66D', animationDelay: '2s' }} />

            <BadgeNotification />

            <Outlet />
        </div>
    );
};

// --- Main Router ---

export const AppRouter = () => {
    const { user } = useAuth();
    const { isPremium } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const pendingCheckout = localStorage.getItem('hooky_pending_checkout');
        const skipLanding = localStorage.getItem('hooky_skip_landing');

        if (user) {
            if (skipLanding === 'true') {
                localStorage.removeItem('hooky_skip_landing');
                navigate('/app/gravar');
                return;
            }

            const customRedirect = localStorage.getItem('hooky_redirect_to');
            if (customRedirect && location.pathname !== customRedirect) {
                navigate(customRedirect);
            }

            if (isPremium) {
                if (pendingCheckout) {
                    localStorage.removeItem('hooky_pending_checkout');
                }
                return;
            }

            if (pendingCheckout === 'true' && location.pathname !== '/checkout') {
                navigate('/checkout');
            }
        }
    }, [user, location.pathname, navigate, isPremium]);

    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/test" element={<LanguageTest />} />
            <Route path="/desafio" element={<ChallengeVSL />} />

            {/* Public Flow with Centralized Layout */}
            <Route element={<PublicLayout />}>
                <Route path="/oferta" element={<SalesPaywallPage />} />

                <Route path={ROUTES.LOGIN} element={<LoginScreen onSuccess={() => {
                    // Login = usuário EXISTENTE, NÃO precisa ir pro checkout
                    localStorage.removeItem('hooky_pending_checkout');
                    window.location.href = ROUTES.RECORDER;
                }} onForgotPassword={() => window.location.href = ROUTES.FORGOT_PASSWORD} />} />

                <Route path={ROUTES.SIGNUP} element={<SignUpScreen onSuccess={() => {
                    if (localStorage.getItem('hooky_pending_checkout')) window.location.href = ROUTES.CHECKOUT;
                    else window.location.href = ROUTES.RECORDER;
                }} />} />



                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordScreen onBack={() => window.location.href = ROUTES.LOGIN} />} />

                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/quiz" element={<QuizPage />} />

                <Route path={ROUTES.CHECKOUT} element={<CheckoutScreen onSuccess={() => {
                    localStorage.removeItem('hooky_pending_checkout');
                    window.location.href = ROUTES.RECORDER;
                }} onError={console.error} planPrice={PLAN_PRICE_BRL} planName="Anual" />} />
            </Route>



            {/* Protected App Routes */}
            <Route element={<RequireAuth />}>
                <Route path={ROUTES.PAYWALL} element={<Paywall onUpgrade={() => window.location.href = ROUTES.CHECKOUT} onClose={() => window.location.href = ROUTES.DASHBOARD} />} />

                <Route element={<AppLayout />}>
                    <Route element={<RequireSubscription />}>
                        <Route path="/app/gravar" element={<RecorderPage />} />
                        <Route path="/app/processando-audio" element={<AudioProcessingPage />} />
                        <Route path="/app/confirmar" element={<ConfirmationPage />} />
                        <Route path="/app/remix" element={<RemixPage />} />
                        <Route path="/app/gerando-script" element={<ScriptGenerationPage />} />
                        <Route path="/app/resultado" element={<ResultPage />} />
                        <Route path="/app/compartilhar" element={<SharePage />} />
                        <Route path="/app/erro" element={
                            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                                <h2>Erro</h2>
                                <p>Algo deu errado.</p>
                                <button onClick={() => window.location.href = ROUTES.RECORDER} className="btn-primary">Tentar Novamente</button>
                            </div>
                        } />

                        <Route path={ROUTES.DASHBOARD} element={<Dashboard onCreateNew={() => window.location.href = ROUTES.RECORDER} onViewLibrary={() => window.location.href = ROUTES.LIBRARY} onViewProgress={() => window.location.href = ROUTES.PROGRESS} />} />
                        <Route path={ROUTES.LIBRARY} element={<ScriptLibrary onBack={() => window.location.href = ROUTES.DASHBOARD} />} />
                        <Route path={ROUTES.PROGRESS} element={<ProgressScreen onBack={() => window.location.href = ROUTES.DASHBOARD} />} />
                    </Route>
                </Route>


            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
