import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from 'zod';

const createMarketplaceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  takeRate: z.number().min(0, 'Take rate must be at least 0').max(100, 'Take rate cannot exceed 100'),
});

// GET /api/experiences/[experienceId]/marketplace
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ experienceId: string }> }
) {
  const { experienceId } = await context.params;
  if (!experienceId) {
    return NextResponse.json({ error: "Missing experienceId" }, { status: 400 });
  }
  try {
    const marketplaces = await prisma.marketplace.findMany({
      where: { experienceId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ marketplaces });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch marketplaces" }, { status: 500 });
  }
}

// POST /api/experiences/[experienceId]/marketplaces
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ experienceId: string }> }
) {
  const { experienceId } = await context.params;
  
  if (!experienceId) {
    return NextResponse.json({ error: "Missing experienceId" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validation = createMarketplaceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { title, takeRate } = validation.data;

    const marketplace = await prisma.marketplace.create({
      data: {
        title,
        takeRate,
        experienceId,
      },
    });

    return NextResponse.json({ marketplace }, { status: 201 });
  } catch (error) {
    console.error('Error creating marketplace:', error);
    return NextResponse.json(
      { error: 'Failed to create marketplace' },
      { status: 500 }
    );
  }
}