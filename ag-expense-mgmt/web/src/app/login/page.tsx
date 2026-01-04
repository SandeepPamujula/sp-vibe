'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const handleLogin = async (role: UserRole) => {
        await login(role);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400">
                        Select a role to sign in to your mock account
                    </p>
                </div>

                <div className="grid gap-4">
                    <RoleCard
                        title="Facility Admin"
                        description="Submit and manage your own expenses"
                        icon="🛡️"
                        role="FACILITY_ADMIN"
                        onSelect={() => handleLogin('FACILITY_ADMIN')}
                    />
                    <RoleCard
                        title="Approver"
                        description="Review and approve/reject expenses"
                        icon="�"
                        role="APPROVER"
                        onSelect={() => handleLogin('APPROVER')}
                    />
                </div>

                <p className="mt-8 text-center text-xs text-slate-500 uppercase tracking-widest">
                    Multi-tenant Expense Management System
                </p>
            </div>
        </div>
    );
}

interface RoleCardProps {
    title: string;
    description: string;
    icon: string;
    role: UserRole;
    onSelect: () => void;
}

function RoleCard({ title, description, icon, onSelect }: RoleCardProps) {
    return (
        <button
            onClick={onSelect}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-left transition-all hover:border-blue-500/50 hover:bg-slate-900 shadow-xl"
        >
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-sm text-slate-400">{description}</p>
                </div>
            </div>
            <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                    className="h-6 w-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </div>
        </button>
    );
}
