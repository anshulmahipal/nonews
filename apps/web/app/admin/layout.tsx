"use client";

import { useAuth } from "../../hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Protects /admin/*: only users with app_metadata.is_admin === true can access.
 * Others are redirected to login (with next return URL) or 403.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isForbiddenPage = pathname === "/admin/forbidden";

  useEffect(() => {
    if (isLoading) return;
    // Forbidden page is allowed for non-admins; no redirect.
    if (isForbiddenPage) return;

    const isAdmin = user?.app_metadata?.is_admin === true;
    if (!user) {
      const next = encodeURIComponent(pathname ?? "/admin/dashboard");
      router.replace(`/login?next=${next}`);
      return;
    }
    if (!isAdmin) {
      router.replace("/admin/forbidden");
      return;
    }
  }, [user, isLoading, router, pathname, isForbiddenPage]);

  if (isLoading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </main>
    );
  }

  const isAdmin = user?.app_metadata?.is_admin === true;
  // Allow forbidden page to render for non-admin; protect other admin routes.
  if (!isForbiddenPage && (!user || !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
