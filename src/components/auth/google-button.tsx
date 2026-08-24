import { signInWithGoogle } from "@/actions/auth/google";
import { googleEnabled } from "@/auth.config";
import { Button } from "@/components/ui/button";

/** Renders nothing unless Google sign in is configured. */
const GoogleButton = () => {
  if (!googleEnabled) return null;
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>
    </>
  );
};

export default GoogleButton;
