import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { playbookSchema } from "@/lib/validators/playbook";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playbooks = await prisma.playbook.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(playbooks);
  } catch (error) {
    console.error("Failed to fetch playbooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch playbooks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = playbookSchema.parse(body);

    const playbook = await prisma.playbook.create({
      data: {
        userId: session.user.id,
        ...data,
      },
    });

    return NextResponse.json(playbook, { status: 201 });
  } catch (error) {
    console.error("Failed to create playbook:", error);
    return NextResponse.json(
      { error: "Failed to create playbook" },
      { status: 500 }
    );
  }
}
