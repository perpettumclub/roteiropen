export interface HookVariation {
    type: string;
    text: string;
    emoji: string;
}

export interface ViralScript {
    hooks: HookVariation[]; // Array of hook variations
    selectedHookIndex: number; // Which hook the user selected
    contexto: string; // Ato II
    conceito: string; // Ato III
    ruptura: string; // Ato IV
    plano: string; // Ato V
    cta: string | CTAStructure; // Ato VI - Agora suporta objeto estruturado
    metadata: {
        duration: string;
        tone: string;
        platform: string;
    };
}

export interface CTAStructure {
    texto: string;
    palavra_chave: string;
    entrega_prometida: string;
    emoji: string;
}

// Saved script with metadata
export interface SavedScript {
    id: string;
    script: ViralScript;
    createdAt: string;
    niche?: string;
    isFavorite: boolean;
}
