
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import InfluencerProfile from "./pages/InfluencerProfile";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import HowItWorks from "./pages/HowItWorks";
import { AuthProvider } from "./contexts/AuthContext";
import UserProfile from "./pages/UserProfile";
import "./utils/authRecovery"; // Import auth recovery utilities

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/influencer/:id" element={<InfluencerProfile />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
