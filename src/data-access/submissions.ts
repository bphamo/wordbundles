import { db } from "@/lib/db";
import type { Prisma, Submission } from "@/generated/prisma";

export type CreateSubmissionInput = Pick<
  Prisma.SubmissionUncheckedCreateInput,
  "boardId" | "text"
>;

export interface ResultOk<T> {
  ok: true;
  data: T;
}

export interface ResultErr {
  ok: false;
  message: string;
  code?: string;
}

export type Result<T> = ResultOk<T> | ResultErr;

function normalizeKeyword(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s\p{P}]+/gu, " ");
}

export async function createSubmission(
  input: CreateSubmissionInput
): Promise<Result<Submission>> {
  try {
    const normalized = normalizeKeyword(input.text);
    const submission = await db.submission.create({
      data: {
        boardId: input.boardId,
        text: input.text,
        normalized,
      },
    });
    return { ok: true, data: submission };
  } catch {
    return {
      ok: false,
      message: "Failed to create submission",
      code: "SUBMISSION_CREATE_FAILED",
    };
  }
}

export async function listTopKeywords(
  boardId: string,
  limit = 25
): Promise<Result<Array<{ normalized: string; count: number }>>> {
  try {
    const groups = await db.submission.groupBy({
      by: ["normalized"],
      where: { boardId, approved: true },
      _count: { normalized: true },
      orderBy: { _count: { normalized: "desc" } },
      take: limit,
    });
    const data = groups.map((g) => ({
      normalized: g.normalized,
      count: g._count.normalized,
    }));
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      message: "Failed to load keywords",
      code: "KEYWORD_LIST_FAILED",
    };
  }
}
