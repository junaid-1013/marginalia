import { Metadata } from "next";
import Link from "next/link";

import GoogleButton from "@/components/auth/google-button";
import LoginForm from "@/components/auth/login/form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Marginalia documents.",
};

export default function Login() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-title">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to pick up where you left off.</p>
      </div>
      <LoginForm />
      <GoogleButton />
      <p className="text-sm text-muted-foreground">
        New to Marginalia?{" "}
        <Button asChild variant="link" className="h-auto p-0 text-sm">
          <Link href="/create-account">Create an account</Link>
        </Button>
      </p>
    </div>
  );
}
