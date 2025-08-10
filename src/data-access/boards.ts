import { db } from "@/lib/db";
import type { Board, Prisma } from "@/generated/prisma";

export type CreateBoardInput = Pick<
  Prisma.BoardUncheckedCreateInput,
  "ownerId" | "title" | "description" | "prompt" | "isPublic" | "moderation"
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

function normalizeModeration(mod?: string): "auto" | "manual" {
  return mod === "manual" ? "manual" : "auto";
}

export async function createBoard(
  input: CreateBoardInput
): Promise<Result<Board>> {
  try {
    const moderation = normalizeModeration(input.moderation);
    const board = await db.board.create({
      data: {
        ownerId: input.ownerId,
        title: input.title,
        description: input.description,
        prompt: input.prompt,
        isPublic: input.isPublic ?? true,
        moderation,
        embedToken: crypto.randomUUID(),
      },
    });
    return { ok: true, data: board };
  } catch {
    return {
      ok: false,
      message: "Failed to create board",
      code: "BOARD_CREATE_FAILED",
    };
  }
}

export async function listBoardsByOwner(
  ownerId: string
): Promise<Result<Board[]>> {
  try {
    const boards = await db.board.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, data: boards };
  } catch {
    return {
      ok: false,
      message: "Failed to load boards",
      code: "BOARD_LIST_FAILED",
    };
  }
}

export async function getBoardById(boardId: string): Promise<Result<Board>> {
  try {
    const board = await db.board.findUnique({ where: { id: boardId } });
    if (!board)
      return { ok: false, message: "Board not found", code: "NOT_FOUND" };
    return { ok: true, data: board };
  } catch {
    return {
      ok: false,
      message: "Failed to load board",
      code: "BOARD_GET_FAILED",
    };
  }
}
