import { useEffect, useState } from "react";
import DashApp from "./products/forecast-dashboard/DashApp";
import HackathonSite from "./products/hackathon-site/App";

type Route = "dashboard" | "hackathon-site";

function currentRoute(): Route {
  return window.location.hash === "#/hackathon-site" ? "hackathon-site" : "dashboard";
}

export default function App() {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route === "hackathon-site" ? <HackathonSite /> : <DashApp />;
}
