import { getBoardAction, listTopKeywordsAction } from "@/app/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function BoardPage({ params }: PageProps) {
  const boardRes = await getBoardAction(params.id);
  if (!boardRes.ok) return notFound();
  const board = boardRes.data;
  const keywordsRes = await listTopKeywordsAction(board.id);
  const keywords = keywordsRes.ok ? keywordsRes.data : [];

  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>{board.title}</CardTitle>
          {board.prompt ? (
            <CardDescription>{board.prompt}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          {keywords.length === 0 ? (
            <p className="text-muted-foreground text-sm">No submissions yet.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {keywords.map((k) => (
                <li
                  key={k.normalized}
                  className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm"
                >
                  {k.normalized} <span className="opacity-70">({k.count})</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <div className="mt-6">
        <SubmissionForm boardId={board.id} />
      </div>
    </main>
  );
}

function SubmissionForm({ boardId }: { boardId: string }) {
  return (
    <form action={handleSubmit} className="flex items-center gap-2">
      <input type="hidden" name="boardId" value={boardId} />
      <Input
        name="text"
        placeholder="Enter a keyword"
        maxLength={80}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}

async function handleSubmit(formData: FormData) {
  "use server";
  const { createSubmissionAction } = await import("@/app/actions");
  const boardId = String(formData.get("boardId") || "");
  const text = String(formData.get("text") || "");
  const res = await createSubmissionAction({ boardId, text });
  if (res.ok) revalidatePath(`/boards/${boardId}`);
}
