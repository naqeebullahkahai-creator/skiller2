import { Outlet } from "react-router-dom";
import MobileOnlyGuard from "./MobileOnlyGuard";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import TopProgressBar from "./TopProgressBar";

const CustomerAppShell = () => {
  return (
    <MobileOnlyGuard appName="FANZOON Shopping">
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        <TopProgressBar />
        <MobileHeader />
        <main className="flex-1 pb-16">
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    </MobileOnlyGuard>
  );
};

export default CustomerAppShell;
