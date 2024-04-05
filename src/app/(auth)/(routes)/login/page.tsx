import Link from "next/link";
import { Metadata } from "next";

import LoginForm from "@/components/auth/login/form";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account.",
};

export default function Login() {
  return (
    <div className="mx-auto md:p-8 lg:p-10 xl:max-w-xl text-foreground">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Login to Your Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to access your account.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/create-account"
            className={cn(buttonVariants({ variant: "link" }), "text-xs")}
          >
            Create an Account ?
          </Link>
        </p>
      </div>
    </div>
  );
}
