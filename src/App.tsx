import { useEffect, useState } from "react";
import DashApp from "./products/forecast-dashboard/DashApp";
import HackathonSite from "./products/hackathon-site/App";
import StopDetailCompare from "./mockups/stopDetail/Compare";
import DispatcherOverviewMockup from "./mockups/dispatcherOverview";

type Route = "dashboard" | "hackathon-site" | "mockups" | "dispatcher-overview";

function currentRoute(): Route {
  if (window.location.hash === "#/hackathon-site") return "hackathon-site";
  if (window.location.hash === "#/mockups") return "mockups";
  if (window.location.hash === "#/dispatcher-overview") return "dispatcher-overview";
  return "dashboard";
}

export default function App() {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route === "hackathon-site") return <HackathonSite />;
  if (route === "mockups") return <StopDetailCompare />;
  if (route === "dispatcher-overview") return <DispatcherOverviewMockup />;
  return <DashApp />;
}
