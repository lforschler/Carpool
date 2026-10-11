import { requireAuth } from "@/lib/require-auth";

export default async function MonthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/month");
  return children;
}
