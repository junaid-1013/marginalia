"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

/**
 * The landing page is static (fast first paint, cacheable), so whether the
 * visitor is logged in is decided here in the browser. Until the session is
 * known, everyone sees the logged-out buttons.
 */
export const useLoggedIn = () => useSession().status === "authenticated";

export const NavActions = () => {
  const loggedIn = useLoggedIn();
  return loggedIn ? (
    <Button asChild size="sm">
      <Link href="/documents">Open app</Link>
    </Button>
  ) : (
    <>
      <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/create-account">Get started</Link>
      </Button>
    </>
  );
};

export const HeroCta = () => {
  const loggedIn = useLoggedIn();
  return (
    <Button asChild size="lg">
      <Link href={loggedIn ? "/documents" : "/create-account"}>
        {loggedIn ? "Open your documents" : "Upload your first PDF"}
      </Link>
    </Button>
  );
};

export const FinalCtaButtons = () => {
  const loggedIn = useLoggedIn();
  return (
    <>
      <Button asChild size="lg">
        <Link href={loggedIn ? "/documents/create" : "/create-account"}>
          {loggedIn ? "Upload a PDF" : "Create an account"}
        </Link>
      </Button>
      {!loggedIn && (
        <Button asChild size="lg" variant="ghost">
          <Link href="/login">Log in</Link>
        </Button>
      )}
    </>
  );
};
