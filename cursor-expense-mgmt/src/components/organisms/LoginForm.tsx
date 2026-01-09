/**
 * LoginForm Component
 *
 * Mock Azure Entra SSO login form with tenant and user selection.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { Select, Spinner } from '../atoms';
import { UserCard } from '../molecules';

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'approver';
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export function LoginForm() {
  const router = useRouter();

  // State
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<TestUser[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null);

  // Loading states
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);

  // Fetch tenants on mount
  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await fetch('/api/auth/tenants');
        const data: ApiResponse<Tenant[]> = await response.json();

        if (data.success && data.data) {
          setTenants(data.data);
          // Auto-select if only one tenant
          if (data.data.length === 1 && data.data[0]) {
            setSelectedTenant(data.data[0].slug);
          }
        } else {
          setError(data.error?.message || 'Failed to load tenants');
        }
      } catch {
        setError('Failed to connect to server');
      } finally {
        setIsLoadingTenants(false);
      }
    }

    fetchTenants();
  }, []);

  // Fetch users when tenant changes
  useEffect(() => {
    if (!selectedTenant) {
      setUsers([]);
      setSelectedUser(null);
      return;
    }

    async function fetchUsers() {
      setIsLoadingUsers(true);
      setError(null);

      try {
        const response = await fetch(`/api/auth/users?tenant=${selectedTenant}`);
        const data: ApiResponse<TestUser[]> = await response.json();

        if (data.success && data.data) {
          setUsers(data.data);
          setSelectedUser(null);
        } else {
          setError(data.error?.message || 'Failed to load users');
        }
      } catch {
        setError('Failed to connect to server');
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [selectedTenant]);

  // Handle user selection and login
  const handleUserClick = useCallback(
    async (user: TestUser) => {
      // If already selected, proceed to login
      if (selectedUser?.id === user.id) {
        await handleLogin(user);
      } else {
        // Select the user
        setSelectedUser(user);
      }
    },
    [selectedUser]
  );

  // Login function
  async function handleLogin(user: TestUser) {
    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mock-sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          tenantSlug: user.tenantSlug,
        }),
      });

      const data: ApiResponse<{ user: TestUser }> = await response.json();

      if (data.success) {
        // For now, just redirect to expenses page
        // JWT session will be implemented in task 2.3
        router.push('/expenses');
      } else {
        setError(data.error?.message || 'Login failed');
        setIsLoggingIn(false);
      }
    } catch {
      setError('Failed to connect to server');
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Header with Azure branding */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MicrosoftLogo />
          <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Azure AD</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Sign in</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Select a tenant and user to continue</p>
      </div>

      {/* Login card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading tenants */}
        {isLoadingTenants ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-zinc-500">Loading organizations...</p>
          </div>
        ) : (
          <>
            {/* Tenant selector */}
            <Select
              label="Organization"
              options={tenants.map((t) => ({ value: t.slug, label: t.name }))}
              placeholder="Select your organization"
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
            />

            {/* User list */}
            {selectedTenant && (
              <div className="mt-6">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Select your account
                </p>

                {isLoadingUsers ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Spinner />
                    <p className="text-sm text-zinc-500">Loading accounts...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-zinc-500">No users found for this organization</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        name={user.name}
                        email={user.email}
                        role={user.role}
                        isSelected={selectedUser?.id === user.id}
                        isLoading={isLoggingIn && selectedUser?.id === user.id}
                        onClick={() => handleUserClick(user)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Dev mode notice */}
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-start gap-2">
            <InfoIcon />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium">Development Mode:</span> This is a mock SSO login. In
              production, users will be redirected to Azure AD for authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
