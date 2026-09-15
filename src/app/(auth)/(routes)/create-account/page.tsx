import { Metadata } from "next";
import Link from "next/link";

import CreateAccountForm from "@/components/auth/create-account/form";
import GoogleButton from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Marginalia account and upload your first PDF.",
};

export default function CreateAccountPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-title">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Then upload a PDF and ask it your first question.
        </p>
      </div>
      <CreateAccountForm />
      <GoogleButton />
      <p className="text-caption">
        Your documents and AI key are handled as described in the{" "}
        <Link href="/privacy" className="underline decoration-highlight decoration-2 underline-offset-4">
          privacy notice
        </Link>
        .
      </p>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Button asChild variant="link" className="h-auto p-0 text-sm">
          <Link href="/login">Log in</Link>
        </Button>
      </p>
    </div>
  );
}
