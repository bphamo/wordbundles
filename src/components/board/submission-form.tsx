import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export function SubmissionForm({ boardId }: { boardId: string }) {
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
