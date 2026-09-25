import { HashRouter, Route, Routes } from "react-router-dom";
import DashApp from "./products/forecast-dashboard/DashApp";
import HackathonSite from "./products/hackathon-site/App";
import StopDetailCompare from "./mockups/stopDetail/Compare";
import DispatcherOverviewMockup from "./mockups/dispatcherOverview";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/hackathon-site" element={<HackathonSite />} />
        <Route path="/mockups" element={<StopDetailCompare />} />
        <Route path="/dashboard-legacy" element={<DashApp />} />
        <Route path="*" element={<DispatcherOverviewMockup />} />
      </Routes>
    </HashRouter>
  );
}
