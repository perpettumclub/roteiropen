import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Feature imports
import { AudioRecorder } from './features/recording';
import { ProcessingView, ScriptOutput, ConfirmationScreen } from './features/script';
import { QuizFunnel, OnboardingScreen } from './features/onboarding';
import type { CreatorProfile } from './features/onboarding';
import { Paywall } from './features/billing';
import { Dashboard, ScriptLibrary, ProgressScreen } from './features/dashboard';
import { YouTubeLinkInput } from './features/remix';
import { ShareScreen } from './features/share';
import { LoginScreen, SignUpScreen, ForgotPasswordScreen, EmailVerificationScreen, AuthProvider, useAuth } from './features/auth';

// Shared imports (now includes services)
import {
  LandingView,
  StreakDisplay,
  UserProvider,
  useUser,
  processAudioToScript,
  transcribeAudio,
  extractProblemSolution,
  BadgeNotification
} from './shared';

import type { ViralScript } from './types';

type AppState = 'idle' | 'onboarding' | 'quiz' | 'paywall' | 'login' | 'signup' | 'emailverification' | 'forgotpassword' | 'dashboard' | 'library' | 'progress' | 'recording' | 'transcribing' | 'confirm' | 'remix' | 'processing' | 'result' | 'share' | 'error';

function AppContent() {
  const [state, setState] = useState<AppState>('idle');
  const [script, setScript] = useState<ViralScript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Remix flow state
  const [capturedAudio, setCapturedAudio] = useState<Blob | null>(null);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);

  // Confirmation flow state
  const [transcription, setTranscription] = useState<string>('');
  const [confirmedProblem, setConfirmedProblem] = useState<string>('');
  const [confirmedSolution, setConfirmedSolution] = useState<string>('');

  // Email verification state
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');

  const {
    hasCompletedQuiz,
    freeScriptsRemaining,
    currentStreak,
    isPremium,
    creatorProfile,
    completeQuiz,
    useScript,
    saveScript,
    checkStreak,
    upgradeToPremium
  } = useUser();

  const { user, loading: authLoading, sendVerificationCode, verifyEmailCode } = useAuth();



  // Check auth and streak on mount
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (hasCompletedQuiz && user) {
      checkStreak();
      if (state === 'idle') {
        setState('recording');
      }
    }
  }, [hasCompletedQuiz, user, authLoading]);

  const startFlow = () => {
    // Check if onboarding was completed
    const onboardingComplete = localStorage.getItem('hooky_onboarding_complete');

    if (!onboardingComplete) {
      setState('onboarding');
    } else if (!hasCompletedQuiz) {
      setState('quiz');
    } else if (!user) {
      // User completed quiz but not logged in -> show login
      setState('login');
    } else {
      // Go directly to recording (main experience)
      setState('recording');
    }
  };

  const handleStartRecording = () => {
    if (!isPremium && freeScriptsRemaining <= 0) {
      setShowPaywall(true);
    } else {
      setState('recording');
    }
  };

  const handleQuizComplete = (profile: CreatorProfile) => {
    completeQuiz(profile);
    // Cal.ai flow: Quiz → Paywall → Login → Recording
    setState('paywall');
  };

  // After recording, transcribe and extract problem/solution for confirmation
  const handleAudioCaptured = async (blob: Blob) => {
    // Check if user can create script
    if (!isPremium && freeScriptsRemaining <= 0) {
      setShowPaywall(true);
      return;
    }

    console.log('Audio captured:', blob.size, 'bytes');
    setCapturedAudio(blob);
    setYoutubeLinks([]);
    setState('transcribing');

    try {
      // Transcribe audio
      const transcribedText = await transcribeAudio(blob);
      setTranscription(transcribedText);

      // Extract problem and solution
      const { problem, solution } = await extractProblemSolution(transcribedText);
      setConfirmedProblem(problem);
      setConfirmedSolution(solution);

      setState('confirm');
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Erro ao transcrever o áudio.');
      setState('error');
    }
  };

  // After confirming problem/solution, go to remix screen
  const handleConfirmProblemSolution = (problem: string, solution: string) => {
    setConfirmedProblem(problem);
    setConfirmedSolution(solution);
    setState('remix');
  };

  // Skip remix and process without YouTube
  const handleSkipRemix = () => {
    processScript([]);
  };

  // Process with YouTube links
  const handleConfirmRemix = () => {
    processScript(youtubeLinks);
  };

  // Actually process the audio + optional YouTube links
  const processScript = async (links: string[]) => {
    if (!capturedAudio) return;

    setState('processing');
    setError(null);

    try {
      const result = await processAudioToScript(capturedAudio, links.length > 0 ? links : undefined);

      // Transform API response to ViralScript format
      const viralScript: ViralScript = {
        hooks: result.script.hooks,
        selectedHookIndex: 0, // Default to first hook
        conflito: result.script.conflito,
        climax: result.script.climax,
        solucao: result.script.solucao,
        cta: result.script.cta,
        metadata: {
          duration: result.script.metadata.duration,
          tone: result.script.metadata.tone,
          platform: result.script.metadata.format
        }
      };

      // Consume one free script
      const canCreate = useScript();
      if (!canCreate) {
        setShowPaywall(true);
        setState('dashboard');
        return;
      }

      // Save script to library
      saveScript(viralScript, creatorProfile?.niche);

      // Update streak
      checkStreak();

      setScript(viralScript);
      setCapturedAudio(null); // Clean up
      setState('result');
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Algo deu errado. Tente novamente.');
      setState('error');
    }
  };

  const handleReset = () => {
    // Go back to recording (main experience)
    setState('recording');
    setScript(null);
    setError(null);
    setCapturedAudio(null);
    setYoutubeLinks([]);
  };

  const handleViewDashboard = () => {
    // Show share screen before dashboard
    setState('share');
  };

  const handleShareComplete = () => {
    setState('dashboard');
  };

  const handleUpgrade = () => {
    upgradeToPremium();
    setShowPaywall(false);
    // After paywall, go to login if not logged in
    if (!user) {
      setState('login');
    } else {
      setState('recording');
    }
  };

  const handleAuthSuccess = () => {
    setState('recording');
  };

  // Check if we should show header elements
  const showHeader = hasCompletedQuiz && !['idle', 'quiz'].includes(state);

  return (
    <div className="app-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Streak & Free Scripts Display */}
      {showHeader && (
        <StreakDisplay
          currentStreak={currentStreak}
          scriptsRemaining={freeScriptsRemaining}
          isPremium={isPremium}
        />
      )}

      {/* Background FX */}
      <div className="bg-noise" />
      <div className="blob" style={{ top: '-10%', left: '-10%', width: '500px', height: '500px', background: '#FFEFBA' }} />
      <div className="blob" style={{ bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: '#FFE66D', animationDelay: '2s' }} />
      <div className="blob" style={{ top: '40%', left: '40%', width: '300px', height: '300px', background: '#FF6B6B', opacity: 0.1, animationDelay: '4s' }} />

      {/* Global Notifications */}
      <BadgeNotification />
      <div className="blob" style={{ top: '-10%', left: '-10%', width: '500px', height: '500px', background: '#FFEFBA' }} />
      <div className="blob" style={{ bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: '#FFE66D', animationDelay: '2s' }} />
      <div className="blob" style={{ top: '40%', left: '40%', width: '300px', height: '300px', background: '#FF6B6B', opacity: 0.1, animationDelay: '4s' }} />

      <AnimatePresence mode="wait">

        {/* IDLE STATE (LANDING PAGE) */}
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%' }}
          >
            <LandingView onStart={startFlow} />
          </motion.div>
        )}

        {/* QUIZ STATE */}
        {state === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <QuizFunnel onComplete={handleQuizComplete} />
          </motion.div>
        )}

        {/* PAYWALL STATE - Mandatory after quiz */}
        {state === 'paywall' && (
          <motion.div
            key="paywall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 1000 }}
          >
            <Paywall
              onUpgrade={handleUpgrade}
              onClose={() => !user ? setState('login') : setState('recording')}
              isRequired={!isPremium}
            />
          </motion.div>
        )}

        {/* LOGIN STATE */}
        {state === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <LoginScreen
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => setState('signup')}
              onForgotPassword={() => setState('forgotpassword')}
            />
          </motion.div>
        )}

        {/* SIGNUP STATE */}
        {state === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <SignUpScreen
              onSuccess={(email?: string) => {
                if (email) {
                  setPendingVerificationEmail(email);
                  setState('emailverification');
                } else {
                  handleAuthSuccess();
                }
              }}
              onSwitchToLogin={() => setState('login')}
            />
          </motion.div>
        )}

        {/* EMAIL VERIFICATION STATE */}
        {state === 'emailverification' && (
          <motion.div
            key="emailverification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <EmailVerificationScreen
              email={pendingVerificationEmail}
              onVerified={handleAuthSuccess}
              onResendCode={() => sendVerificationCode(pendingVerificationEmail)}
              onVerifyCode={(code: string) => verifyEmailCode(pendingVerificationEmail, code)}
              onBack={() => setState('signup')}
            />
          </motion.div>
        )}

        {/* FORGOT PASSWORD STATE */}
        {state === 'forgotpassword' && (
          <motion.div
            key="forgotpassword"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <ForgotPasswordScreen
              onBack={() => setState('login')}
            />
          </motion.div>
        )}

        {/* ONBOARDING STATE - Social proof screen */}
        {state === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 1, width: '100%' }}
          >
            <OnboardingScreen onComplete={() => {
              if (!hasCompletedQuiz) {
                setState('quiz');
              } else {
                setState('recording');
              }
            }} />
          </motion.div>
        )}
        {state === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <Dashboard
              onCreateNew={handleStartRecording}
              onViewLibrary={() => setState('library')}
              onViewProgress={() => setState('progress')}
            />
          </motion.div>
        )}

        {/* LIBRARY STATE */}
        {state === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <ScriptLibrary onBack={() => setState('dashboard')} />
          </motion.div>
        )}

        {/* PROGRESS STATE */}
        {state === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <ProgressScreen onBack={() => setState('dashboard')} />
          </motion.div>
        )}

        {/* RECORDING STATE */}
        {state === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: "backOut" }}
            style={{
              zIndex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'calc(100vh - 120px)',
              width: '100%',
              marginTop: '-40px'
            }}
          >
            <AudioRecorder onAudioCaptured={handleAudioCaptured} />
          </motion.div>
        )}

        {/* TRANSCRIBING STATE */}
        {state === 'transcribing' && (
          <motion.div
            key="transcribing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 1 }}
          >
            <ProcessingView />
          </motion.div>
        )}

        {/* CONFIRM STATE - Problem/Solution review */}
        {state === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <ConfirmationScreen
              transcription={transcription}
              problem={confirmedProblem}
              solution={confirmedSolution}
              onConfirm={handleConfirmProblemSolution}
              onBack={() => setState('recording')}
            />
          </motion.div>
        )}
        {/* REMIX STATE (optional - can skip) */}
        {state === 'remix' && (
          <motion.div
            key="remix"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '500px'
            }}
          >
            <div className="glass-card" style={{
              padding: '2rem',
              borderRadius: '24px',
              width: '100%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                color: 'var(--dark)',
                marginBottom: '0.5rem'
              }}>
                Quer remixar com vídeos virais?
              </h2>
              <p style={{
                color: 'var(--gray)',
                fontSize: '0.95rem',
                marginBottom: '1.5rem'
              }}>
                Adicione vídeos de referência para a IA analisar e combinar com sua ideia
              </p>

              <YouTubeLinkInput
                links={youtubeLinks}
                onLinksChange={setYoutubeLinks}
                maxLinks={3}
              />

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '1.5rem'
              }}>
                {youtubeLinks.length > 0 && (
                  <motion.button
                    onClick={handleConfirmRemix}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: 'var(--dark)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem 1.5rem',
                      borderRadius: '14px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    🚀 Criar Roteiro Remixado
                  </motion.button>
                )}

                <button
                  onClick={handleSkipRemix}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gray)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0.5rem'
                  }}
                >
                  Pular, criar sem remix →
                </button>
              </div>
            </div>
          </motion.div>
        )}


        {state === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 1 }}
          >
            <ProcessingView />
          </motion.div>
        )}

        {/* RESULT STATE */}
        {state === 'result' && script && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{ zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <ScriptOutput script={script} onReset={handleReset} onViewDashboard={handleViewDashboard} />
          </motion.div>
        )}

        {/* SHARE STATE */}
        {state === 'share' && script && (
          <ShareScreen
            scriptContent={`${script.hooks[script.selectedHookIndex]}\n\n${script.conflito}\n\n${script.climax}\n\n${script.solucao}\n\n${script.cta}`}
            onShare={handleShareComplete}
            onSkip={handleShareComplete}
          />
        )}

        {/* ERROR STATE */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card"
            style={{
              zIndex: 1,
              padding: '3rem',
              borderRadius: '24px',
              textAlign: 'center',
              maxWidth: '450px'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😔</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              color: 'var(--dark)',
              marginBottom: '1rem'
            }}>
              Ops! Algo deu errado
            </h2>
            <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
              {error || 'Não foi possível processar seu áudio. Verifique sua conexão e tente novamente.'}
            </p>
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '2rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-colored)'
              }}
            >
              Tentar Novamente
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <Paywall
            onUpgrade={handleUpgrade}
            onClose={() => setShowPaywall(false)}
          />
        )}
      </AnimatePresence>
    </div >
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
