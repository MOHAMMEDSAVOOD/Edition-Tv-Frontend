import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <h2 className="text-2xl font-bold text-foreground">404 - Page Not Found</h2>
      <p className="text-xs text-muted-foreground">The requested CMS route does not exist.</p>
      <Link href="/" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md">
        Return to CMS Studio
      </Link>
    </div>
  );
}
