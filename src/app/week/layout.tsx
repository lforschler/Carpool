import { requireAuth } from "@/lib/require-auth";

export default async function WeekLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/week");
  return children;
}
