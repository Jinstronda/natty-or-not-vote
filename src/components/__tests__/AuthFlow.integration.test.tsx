import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';

// Mock the supabase client
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args) => mockGetSession(...args),
      onAuthStateChange: (...args) => mockOnAuthStateChange(...args),
      signInWithPassword: (...args) => mockSignInWithPassword(...args),
      signOut: (...args) => mockSignOut(...args),
    },
  },
}));

// Mock components that use IntersectionObserver
vi.mock('@/components/InfluencerGrid', () => ({
  default: () => <div data-testid="influencer-grid">Influencer Grid</div>,
}));

vi.mock('@/components/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/SearchBar', () => ({
  default: () => <div data-testid="search-bar">Search Bar</div>,
}));

vi.mock('@/components/SuggestInfluencer', () => ({
  default: () => <div data-testid="suggest-influencer">Suggest Influencer</div>,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({ 
      data: { subscription: { unsubscribe: vi.fn() } } 
    });
  });

  it('handles login flow correctly', async () => {
    mockGetSession.mockResolvedValueOnce({ 
      data: { session: null }, 
      error: null 
    });
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Wait for component to load
    await waitFor(() => {
      const welcomeText = screen.getByText('Welcome Back');
      expect(welcomeText).toBeDefined();
    });

    // Fill in login form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify Supabase was called
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('shows loading state while checking auth', async () => {
    // Mock a delayed response
    mockGetSession.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ data: { session: null }, error: null }), 50)
      )
    );

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Should show loading state initially
    const loadingText = screen.getByText('Checking authentication...');
    expect(loadingText).toBeDefined();

    // Wait for loading to complete
    await waitFor(() => {
      const welcomeText = screen.getByText('Welcome Back');
      expect(welcomeText).toBeDefined();
    }, { timeout: 3000 });
  });

  it('handles authentication state changes correctly', async () => {
    const fakeUser = { id: '123', email: 'user@example.com' };
    let authCallback: (event: string, session: any) => void;

    mockGetSession.mockResolvedValueOnce({ 
      data: { session: null }, 
      error: null 
    });

    mockOnAuthStateChange.mockImplementationOnce((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Initially should show login form
    await waitFor(() => {
      const welcomeText = screen.getByText('Welcome Back');
      expect(welcomeText).toBeDefined();
    });

    // Simulate auth state change (user logs in)
    await act(async () => {
      authCallback!('SIGNED_IN', { user: fakeUser });
    });

    // Should show "already logged in" message
    await waitFor(() => {
      const alreadyLoggedText = screen.getByText('You are already logged in. Redirecting...');
      expect(alreadyLoggedText).toBeDefined();
    });
  });

  it('handles login errors correctly', async () => {
    mockGetSession.mockResolvedValueOnce({ 
      data: { session: null }, 
      error: null 
    });
    mockSignInWithPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Wait for component to load
    await waitFor(() => {
      const welcomeText = screen.getByText('Welcome Back');
      expect(welcomeText).toBeDefined();
    });

    // Fill in login form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Submit form
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should show error message
    await waitFor(() => {
      const errorText = screen.getByText('Invalid credentials');
      expect(errorText).toBeDefined();
    });
  });
}); 