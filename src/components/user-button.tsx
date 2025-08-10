import { getSession, signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function UserButton() {
  const session = await getSession();

  if (!session?.user) {
    return (
      <Button asChild>
        <Link href="/signin">Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">{session.user.name}</span>
      <form action={signOutAction}>
        <Button variant="outline" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}
