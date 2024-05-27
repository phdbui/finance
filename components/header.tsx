// icons
import { Loader2 } from "lucide-react";
import { UserButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import HeaderLogo from "./header-logo";
import Navigation from "./navigation";
import WelcomeMsg from "./welcome-msg";
import Filters from "./filters";

const Header = () => {
  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 lg:px-14 pb-36">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="animate-spin size-8 text-slate-400" />
          </ClerkLoading>
        </div>
        <WelcomeMsg />
        <Filters />
      </div>
    </header>
  );
};

export default Header;
