import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from 'zod';

// Define the validation schema
const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description is too long'),
  priceInCents: z.number().int().min(0, 'Price must be a positive number'),
  postedBy: z.string().min(1, 'Poster ID is required'),
});

// POST /api/marketplaces/[marketplaceId]/items
export async function POST(
  req: NextRequest,
  context: { params: { marketplaceId: string } }
) {
  try {
    const { marketplaceId } = context.params;
    
    // Validate marketplaceId format (basic check for UUID)
    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(marketplaceId)) {
      return NextResponse.json(
        { error: 'Invalid marketplace ID format' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = createItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }


    const { title, description, priceInCents, postedBy } = validation.data;

    // Check if marketplace exists and is active
    const marketplace = await prisma.marketplace.findFirst({
      where: {
        id: marketplaceId,
        active: true,
        deletedAt: null,
      },
    });

    if (!marketplace) {
      return NextResponse.json(
        { error: 'Marketplace not found or inactive' },
        { status: 404 }
      );
    }

    // Create the marketplace item
    const item = await prisma.marketplaceItem.create({
      data: {
        title,
        description,
        priceInCents,
        postedBy,
        marketplaceId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priceInCents: true,
        postedBy: true,
        createdAt: true,
        marketplaceId: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating marketplace item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/marketplaces/[marketplaceId]/items
export async function GET(
  req: NextRequest,
  context: { params: { marketplaceId: string } }
) {
  try {
    const { marketplaceId } = context.params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Validate marketplaceId format
    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(marketplaceId)) {
      return NextResponse.json(
        { error: 'Invalid marketplace ID format' },
        { status: 400 }
      );
    }

    // Check if marketplace exists and is active
    const marketplace = await prisma.marketplace.findFirst({
      where: {
        id: marketplaceId,
        active: true,
        deletedAt: null,
      },
    });

    if (!marketplace) {
      return NextResponse.json(
        { error: 'Marketplace not found or inactive' },
        { status: 404 }
      );
    }

    // Get paginated items
    const [items, total] = await Promise.all([
      prisma.marketplaceItem.findMany({
        where: {
          marketplaceId,
          active: true,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          priceInCents: true,
          postedBy: true,
          createdAt: true,
          MarketplaceItemImage: {
            where: { active: true },
            select: { storageLocation: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.marketplaceItem.count({
        where: {
          marketplaceId,
          active: true,
          deletedAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      items: items.map(item => ({
        ...item,
        imageUrl: item.MarketplaceItemImage[0]?.storageLocation || null,
        MarketplaceItemImage: undefined, // Remove the original array
      })),
      total,
      hasMore: skip + items.length < total,
    });
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
