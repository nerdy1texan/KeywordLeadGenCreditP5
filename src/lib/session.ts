import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { type User } from "@prisma/client";

export async function getSession() {
  return await getServerSession(authOptions);
}

export function isAdmin(user: User) {
  return process.env.ADMIN_EMAIL == user.email;
}
