import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewWorkspacePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/workspace/new");
  }

  const workspace = await prisma.workspace.create({
    data: { userId: session.user.id },
  });

  redirect(`/workspace/${workspace.id}`);
}
