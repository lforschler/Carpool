import { requireAuth } from "@/lib/require-auth";

export default async function AgendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/agenda");
  return children;
}
