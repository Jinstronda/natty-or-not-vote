
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import MobileLoadingDiagnostic from "./components/MobileLoadingDiagnostic";
import "./styles/loading-animations.css";

// Loading component for better UX
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Lazy load all pages for better initial load performance
const Index = lazy(() => import("./pages/Index"));
const InfluencerProfile = lazy(() => import("./pages/InfluencerProfile"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Terms = lazy(() => import("./pages/Terms"));
const ExpertsDirectory = lazy(() => import('./pages/experts/index'));
const ExpertProfilePage = lazy(() => import('./pages/experts/[expertId]'));
const Merch = lazy(() => import("./pages/Merch"));
const DebugUsername = lazy(() => import("./pages/DebugUsername"));
const LoadingDemo = lazy(() => import("./components/OptimizedInfluencerGrid"));

// Error Boundary Component for better error handling
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8">
    <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <button 
      onClick={() => window.location.reload()} 
      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
    >
      Reload Page
    </button>
  </div>
);

const App = () => {
  // Initialize basic tracking (only if gtag is available)
  useEffect(() => {
    // Add conversion tracking for ecommerce
    const trackConversion = (event: string, value?: number) => {
      // Google Analytics 4 conversion tracking
      try {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'conversion', {
            event_name: event,
            value: value,
            currency: 'USD'
          });
        }
      } catch (error) {
        console.warn('GTAg tracking failed:', error);
      }
    };

    // Make tracking available globally for components
    (window as any).trackConversion = trackConversion;
  }, []);

  return (
    <MobileLoadingDiagnostic>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/merch" element={<Merch />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/influencer/:id" element={<InfluencerProfile />} />
                  <Route path="/user/:id" element={<UserProfile />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/experts" element={<ExpertsDirectory />} />
                  <Route path="/experts/:expertId" element={<ExpertProfilePage />} />
                  <Route path="/debug-username" element={<DebugUsername />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MobileLoadingDiagnostic>
  );
};

export default App;
