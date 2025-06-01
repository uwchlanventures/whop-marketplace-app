import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/marketplaces/[marketplaceId]/items/[marketplaceItemId]
export async function GET(
  req: NextRequest,
  context: { params: { marketplaceId: string; marketplaceItemId: string } }
) {
  try {
    const { marketplaceId, marketplaceItemId } = context.params;

    // Validate IDs format (basic check for UUID)
    const isValidUuid = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
    
    if (!isValidUuid.test(marketplaceId) || !isValidUuid.test(marketplaceItemId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Fetch the marketplace item with its image and marketplace info
    const item = await prisma.marketplaceItem.findFirst({
      where: {
        id: marketplaceItemId,
        marketplaceId,
        active: true,
        deletedAt: null,
      },
      include: {
        MarketplaceItemImage: {
          where: { active: true },
          take: 1,
          select: { storageLocation: true }
        },
        marketplace: {
          select: {
            experienceId: true
          }
        }
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found or inactive' },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      id: item.id,
      title: item.title,
      description: item.description,
      priceInCents: item.priceInCents,
      postedBy: item.postedBy,
      imageUrl: item.MarketplaceItemImage[0]?.storageLocation || null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
experienceId: item.marketplace.experienceId,
      marketplaceId: item.marketplaceId,
    };

    return NextResponse.json({ item: response });
  } catch (error) {
    console.error('Error fetching marketplace item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplaces/[marketplaceId]/items/[marketplaceItemId]
export async function DELETE(
  req: NextRequest,
  context: { params: { marketplaceId: string; marketplaceItemId: string } }
) {
  try {
    const { marketplaceId, marketplaceItemId } = context.params;
    
    // Validate IDs format (basic check for UUID)
    const isValidUuid = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
    
    if (!isValidUuid.test(marketplaceId) || !isValidUuid.test(marketplaceItemId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Soft delete the item
    const deletedItem = await prisma.marketplaceItem.update({
      where: {
        id: marketplaceItemId,
        marketplaceId,
      },
      data: {
        active: false,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Item deleted successfully',
      item: deletedItem 
    });
  } catch (error) {
    console.error('Error deleting marketplace item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
