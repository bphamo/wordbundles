import Link from "next/link";
import { listMyBoardsAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function Home() {
  const boards = await listMyBoardsAction();
  if (!boards.ok) {
    redirect("/signin");
  }
  const items = boards.data;
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Boards</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage keyword boards
          </p>
        </div>
        <form action={createBoardFormAction}>
          <Button type="submit">New Board</Button>
        </form>
      </div>
      <div className="grid gap-4 mt-6">
        {items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No boards yet</CardTitle>
              <CardDescription>
                Create your first board to start collecting keywords.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          items.map((b) => (
            <Link key={b.id} href={`/boards/${b.id}`}>
              <Card className="hover:bg-accent/30">
                <CardHeader>
                  <CardTitle>{b.title}</CardTitle>
                  {b.description ? (
                    <CardDescription>{b.description}</CardDescription>
                  ) : null}
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}

async function createBoardFormAction() {
  "use server";
  const { createBoardAction } = await import("@/app/actions");
  await createBoardAction({ title: "Untitled Board" });
}
