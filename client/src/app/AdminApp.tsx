import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";

/** Admin dashboard pages — statically imported so they compile into the
 *  single admin code-split chunk that is lazy-loaded on the command-center
 *  subdomain (see App.tsx).
 */
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminUserDetail from "@/pages/admin/user-detail";
import AdminPlans from "@/pages/admin/plans";
import AdminPlanDetail from "@/pages/admin/plan-detail";
import AdminPaymentsAndSubscriptions from "@/pages/admin/payments";
import AdminAi from "@/pages/admin/ai";
import AdminF1000 from "@/pages/admin/f1000";
import AdminFeatureFlags from "@/pages/admin/feature-flags";
import NotFound from "@/pages/not-found";

export default function AdminApp() {
  return (
    <AdminGuard>
      <AdminLayout>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="plans/:id" element={<AdminPlanDetail />} />
          <Route path="payments" element={<AdminPaymentsAndSubscriptions />} />
          <Route path="ai" element={<AdminAi />} />
          <Route path="f1000" element={<AdminF1000 />} />
          <Route path="feature-flags" element={<AdminFeatureFlags />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AdminLayout>
    </AdminGuard>
  );
}
