import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
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

// ── Eagerly loaded — these are the only modules that matter right now ─────────
import Home from "@/pages/home";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import PrivacyPage from "@/pages/legal/privacy";
import TermsPage from "@/pages/legal/terms";

// ── Lazily loaded — will only be fetched when a user actually navigates there ─
const NotFound                  = lazy(() => import("@/pages/not-found"));
const SharedReportPage          = lazy(() => import("@/pages/shared-report"));
const ConfirmInvitePage         = lazy(() => import("@/pages/confirm-invite"));
const UploadPage                = lazy(() => import("@/pages/upload"));
const Dashboard                 = lazy(() => import("@/pages/dashboard"));
const PathwaysPage              = lazy(() => import("@/pages/pathways"));
const EnterprisePage            = lazy(() => import("@/pages/enterprise"));
const AssessmentPage            = lazy(() => import("@/pages/assessment"));
const ReportPage                = lazy(() => import("@/pages/report"));
const ArkResumePage             = lazy(() => import("@/pages/ark-resume"));
const ContextCraftPage          = lazy(() => import("@/pages/context-craft"));
const SubscriptionPage          = lazy(() => import("@/pages/subscription"));
const CheckoutPage              = lazy(() => import("@/pages/checkout"));
const ProfilePage               = lazy(() => import("@/pages/profile"));
const SchoolDashboard           = lazy(() => import("@/pages/school-dashboard"));
const PlayPage                  = lazy(() => import("@/pages/play"));
const MarketplacePage           = lazy(() => import("@/pages/marketplace"));
const GuinPublicPage            = lazy(() => import("@/pages/guin-public"));
const ArkHistoryPage            = lazy(() => import("@/pages/ark-history"));
const DemoPage                  = lazy(() => import("@/pages/demo"));
const DemoTourPage              = lazy(() => import("@/pages/demo-tour"));
const AdminCcgeImportPage       = lazy(() => import("@/pages/admin-ccge-import"));
const BookCompanionPage         = lazy(() => import("@/pages/book-companion"));
const WorkforcePage             = lazy(() => import("@/pages/workforce"));
const TrainingPage              = lazy(() => import("@/pages/training"));
const TrainingProviderDetailPage = lazy(() => import("@/pages/training-provider-detail"));
const TrainingRegisterPage      = lazy(() => import("@/pages/training-register"));
const F1000Page                 = lazy(() => import("@/pages/f1000"));
const MatchmakingPage           = lazy(() => import("@/pages/matchmaking"));
const MatchmakingDetailPage     = lazy(() => import("@/pages/matchmaking-detail"));

// ── Minimal fallback shown while a lazy chunk is loading ──────────────────────
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

// ── Router ────────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      {/* ── Public — no sidebar, no auth required ───────────────────────── */}
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />

      {/* ── Auth-required — wrapped in AppLayout + ProtectedRoute ─────── */}
      <Route>
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <Switch>
                <Route path="/upload" component={UploadPage} />
                <Route path="/assessment" component={AssessmentPage} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/pathways" component={PathwaysPage} />
                <Route path="/subscription" component={SubscriptionPage} />
                <Route path="/checkout/:id" component={CheckoutPage} />
                <Route path="/profile" component={ProfilePage} />
                <Route path="/play" component={PlayPage} />
                <Route path="/marketplace/publish" component={MarketplacePage} />
                <Route path="/marketplace/bonsai" component={MarketplacePage} />
                <Route path="/marketplace/:id" component={MarketplacePage} />
                <Route path="/marketplace" component={MarketplacePage} />
                <Route path="/ark/history" component={ArkHistoryPage} />

                {/* ── Feature-gated ── */}
                {FEATURES.enterpriseDashboard && (
                  <Route path="/enterprise" component={EnterprisePage} />
                )}
                {FEATURES.executiveReport && (
                  <Route path="/report" component={ReportPage} />
                )}
                {FEATURES.arkResume && (
                  <Route path="/ark-resume" component={ArkResumePage} />
                )}
                {FEATURES.contextCraftPage && (
                  <Route path="/context-craft" component={ContextCraftPage} />
                )}
                {FEATURES.cohorts && (
                  <Route path="/school" component={SchoolDashboard} />
                )}
                {FEATURES.sphinxAdvanced && (
                  <Route path="/marketplace/synergy" component={MarketplacePage} />
                )}
                {FEATURES.sphinxAdvanced && (
                  <Route path="/marketplace/roundtable" component={MarketplacePage} />
                )}
                {FEATURES.sphinxAdvanced && (
                  <Route path="/marketplace/synthesis" component={MarketplacePage} />
                )}
                {FEATURES.corporateMarketplace && (
                  <Route path="/marketplace/corporate" component={MarketplacePage} />
                )}
                {FEATURES.forgeLabDocx && (
                  <Route path="/marketplace/forge-lab" component={MarketplacePage} />
                )}
                {FEATURES.guinPublic && (
                  <Route path="/u/:username" component={GuinPublicPage} />
                )}
                {FEATURES.investorDemo && (
                  <Route path="/demo" component={DemoPage} />
                )}
                {FEATURES.investorDemo && (
                  <Route path="/demo-tour" component={DemoTourPage} />
                )}
                {FEATURES.adminCcgeImport && (
                  <Route path="/admin/ccge-import" component={AdminCcgeImportPage} />
                )}
                {FEATURES.bookCompanion && (
                  <Route path="/book" component={BookCompanionPage} />
                )}
                {FEATURES.institutionWorkforce && (
                  <Route path="/workforce" component={WorkforcePage} />
                )}
                {FEATURES.trainingProviders && (
                  <Route path="/training/register" component={TrainingRegisterPage} />
                )}
                {FEATURES.trainingProviders && (
                  <Route path="/training/p/:slug" component={TrainingProviderDetailPage} />
                )}
                {FEATURES.trainingProviders && (
                  <Route path="/training" component={TrainingPage} />
                )}
                {FEATURES.f1000Promo && (
                  <Route path="/f1000" component={F1000Page} />
                )}
                {FEATURES.matchmaking && (
                  <Route path="/matchmaking/:id" component={MatchmakingDetailPage} />
                )}
                {FEATURES.matchmaking && (
                  <Route path="/matchmaking" component={MatchmakingPage} />
                )}

                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
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
            {/* ScrollToTop is global — renders nothing, just a side-effect */}
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Switch>
                {/* Public bare routes — no sidebar, no auth check */}
                <Route path="/r/:token" component={SharedReportPage} />
                <Route path="/confirm/:token" component={ConfirmInvitePage} />
                <Route component={Router} />
              </Switch>
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
