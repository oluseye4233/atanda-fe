import { Routes, Route, useLocation } from "react-router-dom";
import { DemoLayout } from "@/components/layout/DemoLayout";

// Lazy-loaded or dynamically imported pages in the demo module
import DemoJstIndex from "@/pages/demo/DemoJstIndex";
import DemoSkillGames from "@/pages/demo/DemoSkillGames";
import DemoMarketplace from "@/pages/demo/DemoMarketplace";
import DemoCareerMobility from "@/pages/demo/DemoCareerMobility";
import DemoWorkforce from "@/pages/demo/DemoWorkforce";
import DemoBookCompanion from "@/pages/demo/DemoBookCompanion";
import DemoPlanWalkthroughs from "@/pages/demo/DemoPlanWalkthroughs";

function getActiveStepId(pathname: string): string {
  const cleanPath = pathname.replace(/\/$/, ""); // remove trailing slash
  if (cleanPath === "/demo-tour" || cleanPath === "/demo-tour/jst-index") return "jst";
  if (cleanPath.endsWith("/skill-games")) return "skill-games";
  if (cleanPath.endsWith("/marketplace")) return "marketplace";
  if (cleanPath.endsWith("/career-mobility")) return "mobility";
  if (cleanPath.endsWith("/workforce")) return "workforce";
  if (cleanPath.endsWith("/book")) return "book";
  if (cleanPath.endsWith("/plan-walkthroughs")) return "plan-walkthroughs";
  return "jst";
}

export default function DemoApp() {
  const location = useLocation();
  const activeStepId = getActiveStepId(location.pathname);

  return (
    <DemoLayout activeStepId={activeStepId}>
      <Routes>
        <Route index element={<DemoJstIndex />} />
        <Route path="jst-index" element={<DemoJstIndex />} />
        <Route path="skill-games" element={<DemoSkillGames />} />
        <Route path="marketplace" element={<DemoMarketplace />} />
        <Route path="career-mobility" element={<DemoCareerMobility />} />
        <Route path="workforce" element={<DemoWorkforce />} />
        <Route path="book" element={<DemoBookCompanion />} />
        <Route path="plan-walkthroughs" element={<DemoPlanWalkthroughs />} />
      </Routes>
    </DemoLayout>
  );
}
