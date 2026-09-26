import type { ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginScreen from "./features/login/LoginScreen";
import DispatcherApp from "./features/dispatcher";
import { isAuthenticated } from "./api/auth";

function RequireAuth({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<RequireAuth><DispatcherApp /></RequireAuth>} />
      </Routes>
    </HashRouter>
  );
}
