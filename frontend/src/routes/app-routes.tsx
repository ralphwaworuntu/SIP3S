import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/context/auth-context";
import { useOnlineStatus } from "@/context/online-status-context";
import type { AuthUser } from "@/types/auth";
import { ROUTES } from "@/utils/constants";

const LandingPage = lazy(() => import("@/pages/landing/index"));
const LoginAdmin = lazy(() => import("@/pages/auth/login-admin"));
const LoginUser = lazy(() => import("@/pages/auth/login-user"));
const OfflinePage = lazy(() => import("@/pages/offline/index"));
const SuperAdminDashboard = lazy(() => import("@/pages/dashboard/super-admin/index"));
const AdminSpesialisDashboard = lazy(() => import("@/pages/dashboard/admin-spesialis/index"));
const SuperUserDashboard = lazy(() => import("@/pages/dashboard/super-user/index"));
const PetugasDashboard = lazy(() => import("@/pages/dashboard/end-user/index"));
const BhabinLayout = lazy(() => import("@/pages/dashboard/bhabinkamtibmas/index"));
const BhabinTasks = lazy(() => import("@/pages/dashboard/bhabinkamtibmas/tasks"));
const BhabinVerifyRecipients = lazy(() => import("@/pages/dashboard/bhabinkamtibmas/verify-recipients"));
const BhabinPlantProgress = lazy(() => import("@/pages/dashboard/bhabinkamtibmas/plant-progress"));
const BhabinHarvestVerification = lazy(() => import("@/pages/dashboard/bhabinkamtibmas/harvest-verification"));
const BhabinEscortRequest = lazy(() => import("@/pages/dashboard/bhabinkamtibmas/escort-request"));
const PplDashboard = lazy(() => import("@/pages/dashboard/ppl/index"));

const offlineCapableRoles: AuthUser["role"][] = ["end-user", "bhabinkamtibmas", "ppl"];

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRoles: AuthUser["role"][];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const { isOnline } = useOnlineStatus();

  if (!user) {
    return <Navigate to={ROUTES.beranda} replace />;
  }

  const canAccess = allowedRoles.includes(user.role) || user.role === "super-admin";

  if (!canAccess) {
    return <Navigate to={ROUTES.beranda} replace />;
  }

  if (!isOnline && !offlineCapableRoles.includes(user.role)) {
    return <Navigate to={ROUTES.offline} replace />;
  }

  return children;
};

export const AppRoutes = () => (
  <Suspense fallback={<LoadingScreen message="Memuat aplikasi" />}>
    <Routes>
      <Route path={ROUTES.beranda} element={<LandingPage />} />
      <Route path={ROUTES.loginAdmin} element={<LoginAdmin />} />
      <Route path={ROUTES.loginUser} element={<LoginUser />} />
      <Route path={ROUTES.offline} element={<OfflinePage />} />
      <Route
        path={ROUTES.superAdmin}
        element={
          <ProtectedRoute allowedRoles={["super-admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.adminSpesialis}
        element={
          <ProtectedRoute allowedRoles={["admin-spesialis"]}>
            <AdminSpesialisDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.superUser}
        element={
          <ProtectedRoute allowedRoles={["super-user"]}>
            <SuperUserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.endUser}
        element={
          <ProtectedRoute allowedRoles={["end-user"]}>
            <PetugasDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.bhabinkamtibmas}
        element={
          <ProtectedRoute allowedRoles={["bhabinkamtibmas"]}>
            <BhabinLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BhabinTasks />} />
        <Route path="verifikasi" element={<BhabinVerifyRecipients />} />
        <Route path="tanaman" element={<BhabinPlantProgress />} />
        <Route path="panen" element={<BhabinHarvestVerification />} />
        <Route path="pengawalan" element={<BhabinEscortRequest />} />
      </Route>
      <Route
        path={ROUTES.ppl}
        element={
          <ProtectedRoute allowedRoles={["ppl"]}>
            <PplDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.beranda} replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
