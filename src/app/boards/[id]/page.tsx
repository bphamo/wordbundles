import { getBoardAction, listTopKeywordsAction } from "@/app/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { SubmissionForm } from "@/components/board/submission-form";
import { WordCloud } from "@/components/board/word-cloud";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { id } = await params;
  const boardRes = await getBoardAction(id);
  if (!boardRes.ok) return notFound();
  const board = boardRes.data;
  const keywordsRes = await listTopKeywordsAction(board.id);
  const keywords = keywordsRes.ok ? keywordsRes.data : [];
  console.log(keywords);

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
            <WordCloud keywords={keywords} />
          )}
        </CardContent>
      </Card>
      <div className="mt-6">
        <SubmissionForm boardId={board.id} />
      </div>
    </main>
  );
}
