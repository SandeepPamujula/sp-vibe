export type UserRole = 'FACILITY_ADMIN' | 'APPROVER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    tenantId: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
