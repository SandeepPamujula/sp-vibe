'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
    login: (role: UserRole) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<UserRole, User> = {
    FACILITY_ADMIN: {
        id: 'user-admin',
        name: 'Sandeep (Admin)',
        email: 'sandeeppamujula@gmail.com',
        role: 'FACILITY_ADMIN',
        tenantId: 'tenant-1',
    },
    APPROVER: {
        id: 'user-approver',
        name: 'Sandeep (Approver)',
        email: 'reachsandeepkp@gmail.com',
        role: 'APPROVER',
        tenantId: 'tenant-1',
    },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        // Check for stored auth in localStorage (mocking session persistence)
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch (e) {
                localStorage.removeItem('auth_user');
                setState((s) => ({ ...s, isLoading: false }));
            }
        } else {
            setState((s) => ({ ...s, isLoading: false }));
        }
    }, []);

    const login = useCallback(async (role: UserRole) => {
        setState((s) => ({ ...s, isLoading: true }));

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user = MOCK_USERS[role];
        localStorage.setItem('auth_user', JSON.stringify(user));

        setState({
            user,
            isAuthenticated: true,
            isLoading: false,
        });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('auth_user');
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
