import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/experiences/[experienceId]/memberships
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ experienceId: string }> }
) {
  const { experienceId } = await context.params;
  if (!experienceId) {
    return NextResponse.json({ error: "Missing experienceId" }, { status: 400 });
  }
  try {
    const memberships = await prisma.membership.findMany({
      where: { experienceId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ memberships });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 });
  }
}