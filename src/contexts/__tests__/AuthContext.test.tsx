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
    },
  },
}));

const TestComponent = () => {
  const authContext = useAuth();
  // Store auth functions globally for testing
  (globalThis as any).__authFns = authContext;
  return <div>Test Component</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Always return a mock subscription object
    mockOnAuthStateChange.mockReturnValue({ 
      data: { subscription: { unsubscribe: vi.fn() } } 
    });
  });

  it('initialises with no session', async () => {
    mockGetSession.mockResolvedValueOnce({ 
      data: { session: null }, 
      error: null 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for getSession to be called and processed
    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect((globalThis as any).__authFns.user).toBeNull();
      expect((globalThis as any).__authFns.loading).toBe(false);
    });
  });

  it('initialises with existing session', async () => {
    const fakeUser = { id: '123', email: 'user@example.com' };
    mockGetSession.mockResolvedValueOnce({ 
      data: { session: { user: fakeUser } }, 
      error: null 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for getSession to be called and processed
    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect((globalThis as any).__authFns.user).toEqual(fakeUser);
      expect((globalThis as any).__authFns.loading).toBe(false);
    });
  });

  it('calls supabase signInWithPassword', async () => {
    mockGetSession.mockResolvedValueOnce({ 
      data: { session: null }, 
      error: null 
    });
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect((globalThis as any).__authFns.loading).toBe(false);
    });

    await act(async () => {
      await (globalThis as any).__authFns.signIn('test@example.com', 'pass');
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'pass' 
    });
  });

  it('calls supabase signUp', async () => {
    mockGetSession.mockResolvedValueOnce({ 
      data: { session: null }, 
      error: null 
    });
    mockSignUp.mockResolvedValueOnce({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect((globalThis as any).__authFns.loading).toBe(false);
    });

    await act(async () => {
      await (globalThis as any).__authFns.signUp('email@test.com', 'pw', 'user');
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'email@test.com',
      password: 'pw',
      options: {
        data: {
          username: 'user',
        },
      },
    });
  });

  it('calls supabase signOut', async () => {
    mockGetSession.mockResolvedValueOnce({ 
      data: { session: null }, 
      error: null 
    });
    mockSignOut.mockResolvedValueOnce({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect((globalThis as any).__authFns.loading).toBe(false);
    });

    await act(async () => {
      await (globalThis as any).__authFns.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });
}); 