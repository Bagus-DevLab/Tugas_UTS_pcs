export type User = {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'pakar' | 'user';
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    two_factor_confirmed?: boolean;
    permissions: {
        canManageKnowledgeBase: boolean;
        canManageSystem: boolean;
        canViewAllDetections: boolean;
    };
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
