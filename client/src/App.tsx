import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppLayout } from "@/components/layout/AppLayout";
import { FEATURES } from "@shared/featureFlags";
import ErrorBoundary from "@/components/ErrorBoundary";

// ── Eagerly loaded ────────────────────────────────────────────────────────────
import Home from "@/pages/home";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import PrivacyPage from "@/pages/legal/privacy";
import TermsPage from "@/pages/legal/terms";

// ── Lazily loaded ─────────────────────────────────────────────────────────────
const NotFound                   = lazy(() => import("@/pages/not-found"));
const SharedReportPage           = lazy(() => import("@/pages/shared-report"));
const ConfirmInvitePage          = lazy(() => import("@/pages/confirm-invite"));
const UploadPage                 = lazy(() => import("@/pages/upload"));
const Dashboard                  = lazy(() => import("@/pages/dashboard"));
const PathwaysPage               = lazy(() => import("@/pages/pathways"));
const EnterprisePage             = lazy(() => import("@/pages/enterprise"));
const AssessmentPage             = lazy(() => import("@/pages/assessment"));
const ReportPage                 = lazy(() => import("@/pages/report"));
const ArkResumePage              = lazy(() => import("@/pages/ark-resume"));
const ContextCraftPage           = lazy(() => import("@/pages/context-craft"));
const SubscriptionPage           = lazy(() => import("@/pages/subscription"));
const CheckoutPage               = lazy(() => import("@/pages/checkout"));
const ProfilePage                = lazy(() => import("@/pages/profile"));
const SchoolDashboard            = lazy(() => import("@/pages/school-dashboard"));
const PlayPage                   = lazy(() => import("@/pages/play"));
const MarketplacePage            = lazy(() => import("@/pages/marketplace"));
const GuinPublicPage             = lazy(() => import("@/pages/guin-public"));
const ArkHistoryPage             = lazy(() => import("@/pages/ark-history"));
const DemoPage                   = lazy(() => import("@/pages/demo"));
const DemoTourPage               = lazy(() => import("@/pages/demo-tour"));
const AdminCcgeImportPage        = lazy(() => import("@/pages/admin-ccge-import"));
const BookCompanionPage          = lazy(() => import("@/pages/book-companion"));
const WorkforcePage              = lazy(() => import("@/pages/workforce"));
const TrainingPage               = lazy(() => import("@/pages/training"));
const TrainingProviderDetailPage = lazy(() => import("@/pages/training-provider-detail"));
const TrainingRegisterPage       = lazy(() => import("@/pages/training-register"));
const F1000Page                  = lazy(() => import("@/pages/f1000"));
const MatchmakingPage            = lazy(() => import("@/pages/matchmaking"));
const MatchmakingDetailPage      = lazy(() => import("@/pages/matchmaking-detail"));

// ── Page loader fallback ──────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="font-display font-bold text-primary text-xl tracking-widest animate-pulse">
          ARK
        </span>
        <div className="h-px w-24 bg-linear-to-r from-transparent via-primary/50 to-transparent animate-pulse" />
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ── Public bare routes — no sidebar, no auth check ───── */}
                  <Route path="/r/:token" element={<SharedReportPage />} />
                  <Route path="/confirm/:token" element={<ConfirmInvitePage />} />

                  {/* ── Public full-page routes ──────────────────────────── */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  {/* ── Auth-required — AppLayout + ProtectedRoute ───────── */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <Routes>
                              <Route path="upload" element={<UploadPage />} />
                              <Route path="assessment" element={<AssessmentPage />} />
                              <Route path="dashboard" element={<Dashboard />} />
                              <Route path="pathways" element={<PathwaysPage />} />
                              <Route path="subscription" element={<SubscriptionPage />} />
                              <Route path="checkout/:id" element={<CheckoutPage />} />
                              <Route path="profile" element={<ProfilePage />} />
                              <Route path="play" element={<PlayPage />} />
                              <Route path="marketplace/publish" element={<MarketplacePage />} />
                              <Route path="marketplace/bonsai" element={<MarketplacePage />} />
                              <Route path="marketplace/:id" element={<MarketplacePage />} />
                              <Route path="marketplace" element={<MarketplacePage />} />
                              <Route path="ark/history" element={<ArkHistoryPage />} />

                              {/* ── Feature-gated ─────────────────────────── */}
                              {FEATURES.enterpriseDashboard && (
                                <Route path="enterprise" element={<EnterprisePage />} />
                              )}
                              {FEATURES.executiveReport && (
                                <Route path="report" element={<ReportPage />} />
                              )}
                              {FEATURES.arkResume && (
                                <Route path="ark-resume" element={<ArkResumePage />} />
                              )}
                              {FEATURES.contextCraftPage && (
                                <Route path="context-craft" element={<ContextCraftPage />} />
                              )}
                              {FEATURES.cohorts && (
                                <Route path="school" element={<SchoolDashboard />} />
                              )}
                              {FEATURES.sphinxAdvanced && (
                                <Route path="marketplace/synergy" element={<MarketplacePage />} />
                              )}
                              {FEATURES.sphinxAdvanced && (
                                <Route path="marketplace/roundtable" element={<MarketplacePage />} />
                              )}
                              {FEATURES.sphinxAdvanced && (
                                <Route path="marketplace/synthesis" element={<MarketplacePage />} />
                              )}
                              {FEATURES.corporateMarketplace && (
                                <Route path="marketplace/corporate" element={<MarketplacePage />} />
                              )}
                              {FEATURES.forgeLabDocx && (
                                <Route path="marketplace/forge-lab" element={<MarketplacePage />} />
                              )}
                              {FEATURES.guinPublic && (
                                <Route path="u/:username" element={<GuinPublicPage />} />
                              )}
                              {FEATURES.investorDemo && (
                                <Route path="demo" element={<DemoPage />} />
                              )}
                              {FEATURES.investorDemo && (
                                <Route path="demo-tour" element={<DemoTourPage />} />
                              )}
                              {FEATURES.adminCcgeImport && (
                                <Route path="admin/ccge-import" element={<AdminCcgeImportPage />} />
                              )}
                              {FEATURES.bookCompanion && (
                                <Route path="book" element={<BookCompanionPage />} />
                              )}
                              {FEATURES.institutionWorkforce && (
                                <Route path="workforce" element={<WorkforcePage />} />
                              )}
                              {FEATURES.trainingProviders && (
                                <Route path="training/register" element={<TrainingRegisterPage />} />
                              )}
                              {FEATURES.trainingProviders && (
                                <Route path="training/p/:slug" element={<TrainingProviderDetailPage />} />
                              )}
                              {FEATURES.trainingProviders && (
                                <Route path="training" element={<TrainingPage />} />
                              )}
                              {FEATURES.f1000Promo && (
                                <Route path="f1000" element={<F1000Page />} />
                              )}
                              {FEATURES.matchmaking && (
                                <Route path="matchmaking/:id" element={<MatchmakingDetailPage />} />
                              )}
                              {FEATURES.matchmaking && (
                                <Route path="matchmaking" element={<MatchmakingPage />} />
                              )}

                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
