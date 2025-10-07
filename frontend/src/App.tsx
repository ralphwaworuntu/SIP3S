import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { AppRoutes } from "@/routes/app-routes";
import { OfflineBanner } from "@/components/offline-banner";
import { A2HSBanner } from "@/components/a2hs-banner";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const App = () => {
  const location = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-white">
      <OfflineBanner />
      <AppRoutes />
      <A2HSBanner />
    </div>
  );
};

export default App;

