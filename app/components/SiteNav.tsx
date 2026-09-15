import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteNav({ label }: { label: string }) {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 md:px-16 py-4 flex items-center justify-between border-b border-border bg-nav backdrop-blur-sm">
      <Link
        href="/"
        className="text-muted-3 hover:text-cyan transition-colors text-sm tracking-widest uppercase"
      >
        ← nuno santos
      </Link>
      <div className="flex items-center gap-6">
        <span className="text-cyan font-bold text-sm tracking-widest uppercase hidden sm:inline">
          {label}
        </span>
        <ThemeToggle />
      </div>
    </nav>
  );
}
