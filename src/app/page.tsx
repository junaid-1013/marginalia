import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-center">
          AI Chatbot for your documents
        </h1>
        <p className="text-xl text-center">
          A chatbot that can answer your questions about your documents
        </p>
      </div>
      <div className="flex flex-col space-y-10">
        <Link
          href="/chats"
          className={buttonVariants({
            variant: "default",
          })}
        >
          Chats
        </Link>
      </div>
      <div className="flex gap-5">
        <Link
          className={buttonVariants({
            variant: "outline",
          })}
          href="/login"
        >
          Login
        </Link>
        <Link
          className={buttonVariants({
            variant: "outline",
          })}
          href="/create-account"
        >
          Create Account
        </Link>
      </div>
    </main>
  );
}
