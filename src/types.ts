export interface HookVariation {
    type: string;
    text: string;
    emoji: string;
}

export interface ViralScript {
    hooks: HookVariation[]; // Array of 7 hook variations
    selectedHookIndex: number; // Which hook the user selected
    conflito: string;
    climax: string;
    solucao: string;
    cta: string;
    metadata: {
        duration: string;
        tone: string;
        platform: string;
    };
}

// Saved script with metadata
export interface SavedScript {
    id: string;
    script: ViralScript;
    createdAt: string;
    niche?: string;
    isFavorite: boolean;
}
