import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, NavLink, Route, Routes, Link } from "react-router-dom";
import {
  Compass,
  Leaf,
  BookOpen,
  Mountain,
  Settings as SettingsIcon,
  TrendingUp,
  Footprints,
} from "lucide-react";
import { registerSW } from "virtual:pwa-register";
import "./styles.css";
import { Home } from "./features/dashboard/Home";
import { Missions } from "./features/missions/Missions";
import { Explorer } from "./features/explorer/Explorer";
import { Journal } from "./features/journal/Journal";
import { Progress } from "./features/progress/Progress";
import { Settings } from "./features/settings/Settings";
import { Onboarding } from "./features/onboarding/Onboarding";
registerSW({
  onOfflineReady: () => window.dispatchEvent(new Event("shell-ready")),
});
const links = [
  ["/", "Your trail", Compass],
  ["/missions", "Missions", Footprints],
  ["/explorer", "AI Explorer", Leaf],
  ["/journal", "Journal", BookOpen],
  ["/progress", "Progress", TrendingUp],
] as const;
function App() {
  const [online, setOnline] = useState(navigator.onLine);
  const [onboard, setOnboard] = useState(!localStorage.getItem("onboarded"));
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    const set = () => {
      const theme = localStorage.getItem("theme") || "system";
      document.documentElement.dataset.theme =
        theme === "system"
          ? matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : theme;
    };
    set();
    const media = matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", set);
    window.addEventListener("theme", set);
    return () => {
      media.removeEventListener("change", set);
      window.removeEventListener("theme", set);
    };
  }, []);
  return (
    <>
      <header>
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Mountain size={24} />
          </span>
          TrailMate<span className="ai-tag">AI</span>
        </Link>
        <nav aria-label="Main navigation">
          {links.map(([url, label, Icon]) => (
            <NavLink key={url} to={url} end={url === "/"}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="header-right">
          <span className="network">
            <i className={online ? "online" : "offline"} />
            {online ? "Online" : "Offline"}
          </span>
          <Link to="/settings" aria-label="Settings">
            <SettingsIcon size={20} />
          </Link>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer>
        <span>
          <Mountain size={16} /> A little more nature. A little less noise.
        </span>
        <span>Made for the outdoors · Private by nature</span>
      </footer>
      {onboard && (
        <Onboarding
          done={() => {
            localStorage.setItem("onboarded", "yes");
            setOnboard(false);
          }}
        />
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
