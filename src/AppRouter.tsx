import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';

// Features
import { CheckoutScreen, ChallengeCheckout, Paywall } from './features/billing';
import { Dashboard, ScriptLibrary, ProgressScreen } from './features/dashboard';
import { LoginScreen, SignUpScreen, ForgotPasswordScreen, useAuth, ChallengeLoginScreen } from './features/auth';
import { MembersLayout, MembersLogin, CommunityFeed, ModulesGrid, EventsFeed, ProfileScreen } from './features/members';
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
import { ChallengeSignUpPage } from './pages/ChallengeSignUpPage';
import { ChallengeVSL } from './pages/ChallengeVSL';

// Shared
import { StreakDisplay, BadgeNotification, useUser } from './shared';
import { useSubscription } from './hooks/useSubscription';
import { TierGuard } from './shared/guards';
import { PLAN_PRICE_BRL } from './shared/constants';

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
    const { user } = useAuth();
    const { isPremium, freeScriptsRemaining, hasCompletedQuiz } = useUser();

    const canAccess = isPremium || freeScriptsRemaining > 0 || (hasCompletedQuiz && !!user);

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
            <Route path="/checkout-desafio" element={<ChallengeCheckout onSuccess={() => window.location.href = '/membros'} onError={console.error} />} />

            {/* Public Flow with Centralized Layout */}
            <Route element={<PublicLayout />}>
                <Route path="/oferta" element={<SalesPaywallPage />} />

                <Route path="/login" element={<LoginScreen onSuccess={() => {
                    // Login = usuário EXISTENTE, NÃO precisa ir pro checkout
                    localStorage.removeItem('hooky_pending_checkout');
                    window.location.href = '/app/gravar';
                }} onForgotPassword={() => window.location.href = '/esqueci-senha'} />} />

                <Route path="/signup" element={<SignUpScreen onSuccess={() => {
                    if (localStorage.getItem('hooky_pending_checkout')) window.location.href = '/checkout';
                    else window.location.href = '/app/gravar';
                }} />} />

                <Route path="/signup-desafio" element={<ChallengeSignUpPage />} />
                <Route path="/login-desafio" element={<ChallengeLoginScreen
                    onSuccess={() => window.location.href = '/membros'}
                    onForgotPassword={() => window.location.href = '/esqueci-senha'}
                />} />

                <Route path="/esqueci-senha" element={<ForgotPasswordScreen onBack={() => window.location.href = '/login'} />} />

                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/quiz" element={<QuizPage />} />

                <Route path="/checkout" element={<CheckoutScreen onSuccess={() => {
                    localStorage.removeItem('hooky_pending_checkout');
                    window.location.href = '/app/gravar';
                }} onError={console.error} planPrice={PLAN_PRICE_BRL} planName="Anual" />} />
            </Route>

            <Route path="/membros/login" element={<MembersLogin />} />

            {/* Protected App Routes */}
            <Route element={<RequireAuth />}>
                <Route path="/paywall" element={<Paywall onUpgrade={() => window.location.href = '/checkout'} onClose={() => window.location.href = '/dashboard'} />} />

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
                                <button onClick={() => window.location.href = '/app/gravar'} className="btn-primary">Tentar Novamente</button>
                            </div>
                        } />

                        <Route path="/dashboard" element={<Dashboard onCreateNew={() => window.location.href = '/app/gravar'} onViewLibrary={() => window.location.href = '/biblioteca'} onViewProgress={() => window.location.href = '/progresso'} />} />
                        <Route path="/biblioteca" element={<ScriptLibrary onBack={() => window.location.href = '/dashboard'} />} />
                        <Route path="/progresso" element={<ProgressScreen onBack={() => window.location.href = '/dashboard'} />} />
                    </Route>
                </Route>

                {/* Members Area */}
                <Route path="/membros" element={
                    <TierGuard requiredTier="desafio_vip">
                        <MembersLayout />
                    </TierGuard>
                }>
                    <Route index element={<Navigate to="comunidade" replace />} />
                    <Route path="comunidade" element={<CommunityFeed />} />
                    <Route path="sala-de-aula" element={<ModulesGrid />} />
                    <Route path="agenda" element={<EventsFeed />} />
                    <Route path="perfil" element={<ProfileScreen />} />
                    <Route path="lista" element={<div style={{ padding: '2rem', color: 'white' }}>Lista de Membros (Em breve)</div>} />
                    <Route path="ranking" element={<div style={{ padding: '2rem', color: 'white' }}>Ranking (Em breve)</div>} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
