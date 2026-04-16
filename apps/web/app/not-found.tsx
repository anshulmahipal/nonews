import Link from "next/link";

/**
 * Custom 404 page. Helps debug: when deployed, if you see this with a path,
 * the app is running but that route wasn’t found (wrong path or missing page).
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mb-6 text-center text-slate-600">
        The page you’re looking for doesn’t exist or the route isn’t set up.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  );
}
