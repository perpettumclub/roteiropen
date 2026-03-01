/**
 * Hooky Email Template Reference (React/TSX)
 * 
 * Este arquivo serve apenas como REFERÊNCIA visual e de estrutura.
 * Como o envio atual é feito via Edge Functions (Deno) com strings HTML,
 * este componente pode ser usado para prototipar ou gerar o HTML.
 */

import React from 'react';

interface EmailTemplateProps {
    title: string;
    userName?: string;
    content: React.ReactNode;
    actionUrl?: string;
    actionText?: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
    title,
    userName,
    content,
    actionUrl,
    actionText
}) => {
    const primaryColor = '#FF6B6B';

    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            backgroundColor: '#f9f9f9',
            margin: 0,
            padding: '40px 0'
        }}>
            <div style={{
                maxWidth: '440px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '48px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #eeeeee'
            }}>
                {/* Logo */}
                <div style={{ marginBottom: '36px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '28px' }}>🎤</span>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: primaryColor }}>Hooky</span>
                    </div>
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#333333',
                    marginBottom: '28px'
                }}>
                    {title}
                </h1>

                {/* Text Content */}
                <div style={{
                    fontSize: '15px',
                    lineHeight: '22px',
                    color: '#333333',
                    marginBottom: '24px'
                }}>
                    {userName && <p>Olá, {userName}!</p>}
                    {content}
                </div>

                {/* Action Button */}
                {actionUrl && actionText && (
                    <div style={{ textAlign: 'center' }}>
                        <a
                            href={actionUrl}
                            style={{
                                display: 'inline-block',
                                backgroundColor: primaryColor,
                                color: 'white',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '16px'
                            }}
                        >
                            {actionText}
                        </a>
                    </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: '24px' }}>
                    <p style={{ fontSize: '14px', color: '#666666', lineHeight: '20px' }}>
                        Se precisar de ajuda, responda este email. Estamos aqui para você!
                    </p>
                    <div style={{ textAlign: 'left', marginTop: '24px', fontSize: '11px', color: '#9ca3af' }}>
                        Powered by <span style={{ fontWeight: 700, color: primaryColor, marginLeft: '2px' }}>Hooky</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
