import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import ErrorBoundary from "@/components/ErrorBoundary";

// ── Public pages — eager (main bundle) ────────────────────────────────────────
import Home from "@/pages/home";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import VerifyAccountPage from "@/pages/auth/verify-account";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import VerifyResetPage from "@/pages/auth/verify-reset";
import ResetPasswordPage from "@/pages/auth/reset-password";
import PrivacyPage from "@/pages/legal/privacy";
import TermsPage from "@/pages/legal/terms";
import PaymentSuccessPage from "@/pages/payments/success";
import PaymentFailedPage from "@/pages/payments/failed";
import NotFound from "@/pages/not-found";

// ── Authenticated app — ONE lazy chunk, loaded on first protected navigation ──
const AuthenticatedApp = lazy(() => import("@/app/AuthenticatedApp"));

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <SonnerToaster />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* ── Public — no sidebar, no auth ─────────────────────── */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/verify-account" element={<VerifyAccountPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/verify-reset" element={<VerifyResetPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/payments/success" element={<PaymentSuccessPage />} />
                  <Route path="/payments/failed" element={<PaymentFailedPage />} />

                {/* ── Everything else → the authenticated bundle ───────── */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<TopLoadingBar />}>
                        <AuthenticatedApp />                      
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
