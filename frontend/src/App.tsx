import type { ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginScreen from "./features/login/LoginScreen";
import DispatcherApp from "./features/dispatcher";
import TimeStripVariantsPrototype from "./features/dispatcher/panels/timeStrip/prototype/TimeStripVariantsPrototype";
import { isAuthenticated } from "./api/auth";

function RequireAuth({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        {/* PROTOTYPE — throwaway comparison of time-strip encodings, no auth/API needed. Temporarily
            live on prod for the team to review; pull this route once a variant is picked. */}
        <Route path="/prototype/time-strip" element={<TimeStripVariantsPrototype />} />
        <Route path="*" element={<RequireAuth><DispatcherApp /></RequireAuth>} />
      </Routes>
    </HashRouter>
  );
}
