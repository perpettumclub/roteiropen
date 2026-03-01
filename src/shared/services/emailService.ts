/**
 * Email Service for Progress Dashboard
 * Calls the send-progress-email Edge Function
 */

import { supabase } from '../../lib/supabase';

export type ProgressEmailType =
    | 'upload_confirmation'
    | 'goal_proximity'
    | 'goal_achieved'
    | 'reengagement_7d'
    | 'reengagement_15d'
    | 'reengagement_30d';

interface SendEmailParams {
    userId: string;
    emailType: ProgressEmailType;
    metadata?: {
        seguidores?: number;
        engajamento?: number;
        meta?: number;
        percentMeta?: number;
        faltam?: number;
        [key: string]: any;
    };
}

interface SendEmailResult {
    success: boolean;
    email_id?: string;
    reason?: string;
    error?: string;
}

/**
 * Send a progress-related email via Edge Function
 * The Edge Function handles spam prevention and logging
 */
export async function sendProgressEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { userId, emailType, metadata = {} } = params;

    try {
        const { data, error } = await supabase.functions.invoke('send-progress-email', {
            body: {
                user_id: userId,
                email_type: emailType,
                metadata
            }
        });

        if (error) {
            console.error('[Email] Error calling Edge Function:', error);
            return { success: false, error: error.message };
        }



        return data as SendEmailResult;

    } catch (error: any) {
        console.error('[Email] Unexpected error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user is approaching their goal and send notification
 * Called after saving new metrics
 */
export async function checkGoalProximityAndNotify(
    userId: string,
    currentFollowers: number,
    targetFollowers: number | undefined
): Promise<void> {
    if (!targetFollowers || targetFollowers <= 0) return;

    const percent = Math.round((currentFollowers / targetFollowers) * 100);
    const faltam = targetFollowers - currentFollowers;

    // Goal achieved!
    if (currentFollowers >= targetFollowers) {
        await sendProgressEmail({
            userId,
            emailType: 'goal_achieved',
            metadata: {
                seguidores: currentFollowers,
                meta: targetFollowers,
                percentMeta: 100
            }
        });
        return;
    }

    // Approaching goal (85%, 90%, 95%)
    if (percent >= 85 && percent < 100) {
        await sendProgressEmail({
            userId,
            emailType: 'goal_proximity',
            metadata: {
                seguidores: currentFollowers,
                meta: targetFollowers,
                percentMeta: percent,
                faltam
            }
        });
    }
}

/**
 * Send upload confirmation email with metrics summary
 */
export async function sendUploadConfirmation(
    userId: string,
    metrics: {
        seguidores?: number;
        engajamento?: number;
        meta?: number;
    }
): Promise<void> {
    const percentMeta = metrics.meta && metrics.seguidores
        ? Math.round((metrics.seguidores / metrics.meta) * 100)
        : undefined;

    const faltam = metrics.meta && metrics.seguidores
        ? metrics.meta - metrics.seguidores
        : undefined;

    await sendProgressEmail({
        userId,
        emailType: 'upload_confirmation',
        metadata: {
            seguidores: metrics.seguidores,
            engajamento: metrics.engajamento,
            meta: metrics.meta,
            percentMeta,
            faltam
        }
    });
}
