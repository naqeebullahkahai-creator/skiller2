import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import CategoryNav from "./CategoryNav";
import MobileHeader from "./MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileHeader />;
  }

  return (
    <header>
      <TopBar />
      <MainHeader />
      <CategoryNav />
    </header>
  );
};

export default Header;
