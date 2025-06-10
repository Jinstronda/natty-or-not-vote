import { render, waitFor, act } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Create mock functions
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args) => mockGetSession(...args),
      onAuthStateChange: (...args) => mockOnAuthStateChange(...args),
      signUp: (...args) => mockSignUp(...args),
      signInWithPassword: (...args) => mockSignInWithPassword(...args),
      signOut: (...args) => mockSignOut(...args),
      signInWithOAuth: vi.fn(),
    },
  },
}));

// Helper test component to access context inside tests
const TestComponent = () => {
  const { user, signUp, signIn, signOut } = useAuth();
  // expose functions for tests via window (only used inside tests)
  // @ts-ignore
  globalThis.__authFns = { user, signUp, signIn, signOut };
  return null;
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initialises with no session', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    // mock subscription
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      // @ts-ignore
      expect(globalThis.__authFns.user).toBeNull();
    });
  });

  it('initialises with existing session', async () => {
    const fakeUser = { id: '123', email: 'user@example.com' } as any;
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: fakeUser } }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      // @ts-ignore
      expect(globalThis.__authFns.user).toEqual(fakeUser);
    });
  });

  it('calls supabase signInWithPassword', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      // @ts-ignore
      await globalThis.__authFns.signIn('test@example.com', 'pass');
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'pass' });
  });

  it('calls supabase signUp', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mockSignUp.mockResolvedValueOnce({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      // @ts-ignore
      await globalThis.__authFns.signUp('email@test.com', 'pw', 'user');
    });

    expect(mockSignUp).toHaveBeenCalled();
  });

  it('calls supabase signOut', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mockSignOut.mockResolvedValueOnce({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      // @ts-ignore
      await globalThis.__authFns.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });
}); 