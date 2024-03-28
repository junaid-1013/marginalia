import Link from "next/link";

import { signOut } from "@/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IProps {
  children: React.ReactNode;
}
const MainLayout = ({ children }: IProps) => {
  return (
    <>
      <header className="bg-amber-950 border-b border-b-orange-400 text-white ">
        <div className="flex justify-between container items-center py-4">
          <Link
            href="/chats"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Chats
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button type="submit">Signout</Button>
          </form>
        </div>
      </header>
      <main className="container py-4">{children}</main>
    </>
  );
};

export default MainLayout;
