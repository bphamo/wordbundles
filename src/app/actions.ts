"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import {
  createBoard,
  getBoardById,
  listBoardsByOwner,
} from "@/data-access/boards";
import { createSubmission, listTopKeywords } from "@/data-access/submissions";
import { redirect } from "next/navigation";

export const getSession = async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
};

export async function signOutAction() {
  const result = await auth.api.signOut({ headers: await headers() });
  if (result.success) {
    redirect("/signin");
  }
  return {
    ok: result.success,
    message: result.success ? "" : "Sign-out failed",
  };
}

const signInSchema = z.object({
  email: z.email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export async function signInAction(raw: unknown) {
  const input = signInSchema.safeParse(raw);
  if (!input.success) {
    const message =
      input.error.issues[0]?.message || "Invalid input. Please try again.";
    return { ok: false as const, message };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: input.data.email,
        password: input.data.password,
      },
    });
    redirect("/");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Sign-in failed";
    return { ok: false as const, message };
  }

  return { ok: true as const, message: "" };
}

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function signUpAction(raw: unknown) {
  const input = signUpSchema.safeParse(raw);
  if (!input.success) {
    const message =
      input.error.issues[0]?.message || "Invalid input. Please try again.";
    return { ok: false as const, message };
  }
  try {
    await auth.api.signUpEmail({
      body: {
        name: input.data.name,
        email: input.data.email,
        password: input.data.password,
      },
    });
    redirect("/");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Sign-up failed";
    return { ok: false as const, message };
  }
  return { ok: true as const, message: "" };
}

const createBoardSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  prompt: z.string().max(200).optional(),
  isPublic: z.boolean().optional(),
  moderation: z.enum(["auto", "manual"]).optional(),
});

export async function createBoardAction(raw: unknown) {
  const session = await getSession();
  if (!session?.user) return { ok: false as const, message: "Unauthorized" };
  const input = createBoardSchema.safeParse(raw);
  if (!input.success) return { ok: false as const, message: "Invalid input" };
  const result = await createBoard({ ownerId: session.user.id, ...input.data });
  if (result.ok) revalidatePath("/dashboard");
  return result;
}

export async function listMyBoardsAction() {
  const session = await getSession();
  if (!session?.user) return { ok: false as const, message: "Unauthorized" };
  return listBoardsByOwner(session.user.id);
}

const createSubmissionSchema = z.object({
  boardId: z.string().min(1),
  text: z.string().min(1).max(80),
});

export async function createSubmissionAction(raw: unknown) {
  const input = createSubmissionSchema.safeParse(raw);
  if (!input.success) return { ok: false as const, message: "Invalid input" };
  const result = await createSubmission(input.data);
  if (result.ok) revalidateTag(`board:${result.data.boardId}:keywords`);
  return result;
}

export async function getBoardAction(boardId: string) {
  return getBoardById(boardId);
}

export async function listTopKeywordsAction(boardId: string) {
  // This can be wrapped with cache tags if needed in RSC usage
  return listTopKeywords(boardId, 50);
}
