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

// Generic state used by useFormState-driven auth forms
export interface FormState {
  ok: boolean;
  message: string;
}

// Helpers
function formDataToObject(formData: FormData): Record<string, string> {
  const entries = Array.from(formData.entries()).map(
    ([k, v]) => [k, String(v)] as const
  );
  return Object.fromEntries(entries);
}

// Sign in
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});
export type SignInForm = z.infer<typeof signInSchema>;

export async function signInAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = formDataToObject(formData);
  const parsed = signInSchema.safeParse({
    email: raw.email,
    password: raw.password,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message || "Invalid input. Please try again.",
    };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });
    redirect("/");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign-in failed";
    return { ok: false, message };
  }
  return { ok: true, message: "" };
}

// Sign up
const signUpSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type SignUpForm = z.infer<typeof signUpSchema>;

export async function signUpAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = formDataToObject(formData);
  const parsed = signUpSchema.safeParse({
    name: raw.name,
    email: raw.email,
    password: raw.password,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message || "Invalid input. Please try again.",
    };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });
    redirect("/");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign-up failed";
    return { ok: false, message };
  }
  return { ok: true, message: "" };
}

const createBoardSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  prompt: z.string().max(200).optional(),
  isPublic: z.boolean().optional(),
  moderation: z.enum(["auto", "manual"]).optional(),
});
export type CreateBoardForm = z.infer<typeof createBoardSchema>;

export async function createBoardAction(raw: CreateBoardForm) {
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
export type CreateSubmissionForm = z.infer<typeof createSubmissionSchema>;

export async function createSubmissionAction(raw: CreateSubmissionForm) {
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
  const result = await listTopKeywords(boardId, 50);
  console.log(result);
  return result;
}
