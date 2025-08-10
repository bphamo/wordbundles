"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getSession = async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
};
