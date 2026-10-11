import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Server-side guard for schedule pages (backup to proxy). */
export async function requireAuth(callbackPath: string) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }
  return session;
}
