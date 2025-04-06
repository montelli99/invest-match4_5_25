import { Footer } from "./Footer";
import { NavigationBar } from "./NavigationBar";

interface LayoutProps {
  showAuth?: () => void;
  children: React.ReactNode;
}

export function Layout({ children, showAuth }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar showAuth={showAuth || (() => {})} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
