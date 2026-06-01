"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

const HIDE_NAV_PATHS = ["/login", "/auth/callback", "/oauth/callback"];

function shouldShowNav(pathname: string | null): boolean {
  if (!pathname) return true;
  return !HIDE_NAV_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = shouldShowNav(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {showNav && <Nav />}
      <div className="flex-1">{children}</div>
      {showNav && <Footer />}
    </div>
  );
}
