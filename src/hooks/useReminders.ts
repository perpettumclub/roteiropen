import { useState, useEffect } from 'react';
import { MILLISECONDS_PER_DAY } from '../shared/constants';

const STORAGE_KEY = 'hooky_screenshots';


export const useReminders = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('Seu navegador não suporta notificações.');
            return;
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    };

    const checkProgressReminder = () => {
        if (permission !== 'granted') return;

        // 1. Get last upload date
        const savedScreenshots = localStorage.getItem(STORAGE_KEY);
        let lastDate = new Date(0); // Epoch

        if (savedScreenshots) {
            const parsed = JSON.parse(savedScreenshots);
            if (parsed.length > 0) {
                // Assuming sorted or finding max
                // Screenshots structure: { date: isoString, ... }
                const dates = parsed.map((s: any) => new Date(s.date).getTime());
                lastDate = new Date(Math.max(...dates));
            }
        }

        // 2. Check if > 7 days
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / MILLISECONDS_PER_DAY);

        if (diffDays > 7) {
            // Trigger Notification
            new Notification(' Hora de atualizar seu progresso! 📸', {
                body: `Já faz ${diffDays} dias desde o seu último print. Veja o quanto você cresceu!`,
                icon: '/pwa-192x192.png', // Fallback or valid path
                tag: 'progress-reminder' // Avoid duplicate notifications
            });
        }
    };

    // Auto-check on mount
    useEffect(() => {
        // Check only once per session or day? For now, on mount is fine.
        if (permission === 'granted') {
            checkProgressReminder();
        }
    }, [permission]);

    return {
        permission,
        requestPermission,
        checkProgressReminder
    };
};
