import { requireAuth } from "@/lib/require-auth";

export default async function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/family");
  return children;
}
