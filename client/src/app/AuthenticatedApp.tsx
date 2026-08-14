import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

/** MVP-scope authenticated pages
 Imported statically so they compile into ONE code-split chunk that is
 lazy-loaded as a unit the first time an authenticated route is hit
 (see App.tsx). Out-of-scope modules (marketplace, matchmaking, workforce,
 training, etc.) are intentionally excluded until their module is revived.

 Module 1 — Career Assessment (CV → JST score + reports)

*/

import UploadPage from "@/pages/upload";
import AssessmentPage from "@/pages/assessment";
import Dashboard from "@/pages/dashboard";
import PathwaysPage from "@/pages/pathways";
import ArkResumePage from "@/pages/ark-resume";
import ReportPage from "@/pages/report";
import ArkHistoryPage from "@/pages/ark-history";

import PlayPage from "@/pages/play";
import ProfilePage from "@/pages/profile";
import SubscriptionPage from "@/pages/subscription";
import CheckoutPage from "@/pages/checkout";

import F1000Page from "@/pages/f1000";
import BookCompanionPage from "@/pages/book-companion";
import MarketplacePage from "@/pages/marketplace";

import NotFound from "@/pages/not-found";

/**
 * The entire authenticated experience, rendered inside the sidebar shell.
 * This whole tree ships as a single lazy chunk.
 */
export default function AuthenticatedApp() {
  return (
    <AppLayout>
      <Routes>
        {/* Default → dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Module 1 — Career Assessment */}
        <Route path="upload" element={<UploadPage />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pathways" element={<PathwaysPage />} />
        <Route path="ark-resume" element={<ArkResumePage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="ark/history" element={<ArkHistoryPage />} />

        {/* Module 2 — Upskilling Games */}
        <Route path="play" element={<PlayPage />} />

        {/* Module 3 — SPHINX Marketplace */}
        <Route path="marketplace/*" element={<MarketplacePage />} />

        {/* Module 4 — Book Companion */}
        <Route path="book" element={<BookCompanionPage />} />

        {/* F1000 founding-member promo */}
        <Route path="f1000" element={<F1000Page />} />

        {/* Account chrome */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="checkout/:id" element={<CheckoutPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}
