"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggler } from "@/components/ui/theme-toggler";
import { cn } from "@/lib/utils";
import { UserNav, type IHeaderUser } from "./user-nav";

export const HEADER_HEIGHT = "4rem";

const Header = ({ user }: { user: IHeaderUser }) => {
  const pathname = usePathname();
  // the document workspace uses the full width, other pages sit in the container
  const isWorkspace = /^\/documents\/[^/]+\//.test(pathname) && pathname !== "/documents/create";
  const onDocuments = pathname.startsWith("/documents");

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <div
        className={cn(
          "flex h-16 items-center justify-between gap-4",
          isWorkspace ? "px-4 sm:px-5" : "container"
        )}
      >
        <div className="flex items-center gap-1 sm:gap-3">
          <Link href="/documents" aria-label="Marginalia, all documents" className="rounded-md">
            <Logo />
          </Link>
          <nav aria-label="Main" className="ml-2 hidden sm:block">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={cn(onDocuments && "bg-accent/60")}
            >
              <Link href="/documents" aria-current={onDocuments ? "page" : undefined}>
                Documents
              </Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggler />
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
};

export default Header;
