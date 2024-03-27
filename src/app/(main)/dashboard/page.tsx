import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
const Dashboard = async () => {
  const session = await auth();
  return (
    <>
      <header className="bg-amber-950 border-b border-b-orange-400 text-white ">
        <div className="flex justify-between container items-center py-4">
          <p>Protected Dashboard</p>
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
      <main className="container py-4">
        <p>{JSON.stringify(session)}</p>
        <div className="flex gap-10 my-10">
          <button className="border border-black aspect-square w-40 rounded-md cursor-pointer">
            <Link
              href="/create"
              className="bg-red-500 w-full h-full flex items-center  justify-center"
            >
              <PlusIcon className="text-amber-950 w-10 h-10" />
            </Link>
          </button>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
