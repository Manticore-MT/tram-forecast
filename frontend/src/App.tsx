import type { ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import DashApp from "./products/forecast-dashboard/DashApp";
import LoginScreen from "./products/forecast-dashboard/LoginScreen";
import StopDetailCompare from "./mockups/stopDetail/Compare";
import DispatcherOverviewMockup from "./mockups/dispatcherOverview";
import { isAuthenticated } from "./api/auth";

function RequireAuth({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/mockups" element={<StopDetailCompare />} />
        <Route path="/dashboard-legacy" element={<DashApp />} />
        <Route path="*" element={<RequireAuth><DispatcherOverviewMockup /></RequireAuth>} />
      </Routes>
    </HashRouter>
  );
}
