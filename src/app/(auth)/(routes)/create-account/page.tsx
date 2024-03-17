import { Metadata } from "next";
import Link from "next/link";

import CreateAccountForm from "@/components/auth/create-account/form";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to access your dashboard and more.",
};

export default function CreateAccountPage() {
  return (
    <div className="mx-auto md:p-8 lg:p-10 lg:pt-32">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 hidden md:right-8 md:top-8 lg:inline-block"
        )}
      >
        Login
      </Link>
      <div className="flex w-full flex-col justify-center space-y-6 sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account.
          </p>
        </div>
        <CreateAccountForm />
        <p className="px-8 text-center text-sm text-muted-foreground sm:w-[350px]">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
