import { render, act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth-context';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should initialize with null user', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        // After effect runs
        await act(async () => {
            jest.runAllTimers();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });

    it('should login and store user in localStorage', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            jest.runAllTimers();
        });

        await act(async () => {
            const loginPromise = result.current.login('FACILITY_ADMIN');
            jest.runAllTimers();
            await loginPromise;
        });

        expect(result.current.user?.role).toBe('FACILITY_ADMIN');
        expect(result.current.user?.email).toBe('sandeeppamujula@gmail.com');
        expect(result.current.isAuthenticated).toBe(true);
        expect(localStorage.getItem('auth_user')).toContain('FACILITY_ADMIN');
    });

    it('should logout and remove user from localStorage', async () => {
        // Pre-set user in localStorage
        localStorage.setItem('auth_user', JSON.stringify({ id: '1', role: 'FACILITY_ADMIN' }));

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            jest.runAllTimers();
        });

        expect(result.current.isAuthenticated).toBe(true);

        act(() => {
            result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('should throw error if useAuth is used outside AuthProvider', () => {
        // Silence console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');

        consoleSpy.mockRestore();
    });
});
