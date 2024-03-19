import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
const Dashboard = async () => {
  const session = await auth();
  return (
    <div>
      <p>Protected Dashboard</p>
      <p>{JSON.stringify(session)}</p>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit">Signout</Button>
      </form>
    </div>
  );
};

export default Dashboard;
