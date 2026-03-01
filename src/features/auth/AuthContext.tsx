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
    signInWithGoogle: (redirectPath?: string) => Promise<{ error: Error | null }>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
    resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
    sendVerificationCode: (email: string) => Promise<{ error: Error | null }>;
    verifyEmailCode: (email: string, code: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {


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
        const affiliateCode = localStorage.getItem('roteiropen_affiliate');

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
                },
                emailRedirectTo: window.location.origin, // Explicitly redirect to current origin after confirmation
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            // Limpeza geral para garantir privacidade
            localStorage.clear(); // Remove flags de checkout, steps, etc.
            setUser(null);
            setSession(null);
            window.location.href = '/';
        }
    };

    const signInWithGoogle = async (redirectPath?: string) => {
        const redirectTo = redirectPath
            ? `${window.location.origin}${redirectPath}`
            : window.location.origin;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
            },
        });
        return { error: error as Error | null };
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

    const sendVerificationCode = async (email: string) => {
        try {
            const response = await supabase.functions.invoke('send-verification-code', {
                body: { email },
            });
            if (response.error) {
                return { error: new Error(response.error.message) };
            }
            if (response.data?.error) {
                return { error: new Error(response.data.error) };
            }
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    const verifyEmailCode = async (email: string, code: string) => {
        try {
            const response = await supabase.functions.invoke('verify-email-code', {
                body: { email, code },
            });
            if (response.error) {
                return { error: new Error(response.error.message) };
            }
            if (response.data?.error) {
                return { error: new Error(response.data.error) };
            }
            // Refresh session after verification
            await supabase.auth.refreshSession();
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signIn,
            signUp,
            signOut,
            signInWithGoogle,
            resetPassword,
            resendConfirmationEmail,
            sendVerificationCode,
            verifyEmailCode,
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
