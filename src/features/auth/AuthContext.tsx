import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
    resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle email confirmation callback - Supabase redirects with tokens in URL hash
        const handleEmailConfirmation = async () => {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');

            // If this is an email confirmation callback
            if (accessToken && (type === 'signup' || type === 'email')) {
                console.log('✅ Email confirmation detected, processing...');
                // Clear the hash from URL to prevent re-processing
                window.history.replaceState(null, '', window.location.pathname);

                // The session will be automatically picked up by onAuthStateChange
                // but we need to explicitly set it if tokens are in URL
                if (refreshToken) {
                    await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                }
            }
        };

        handleEmailConfirmation();

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                console.log('🔄 Auth state changed:', _event);
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);


    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error as Error | null };
    };

    const signUp = async (email: string, password: string, name?: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
                emailRedirectTo: window.location.origin, // Explicitly redirect to current origin after confirmation
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error: error as Error | null };
    };

    const resendConfirmationEmail = async (email: string) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
        });
        return { error: error as Error | null };
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signIn,
            signUp,
            signOut,
            resetPassword,
            resendConfirmationEmail,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
