import { NextResponse } from 'next/server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { verifyUserToken } from '@whop/api';
import { whopApi } from '@/lib/whop-api';
import { prisma } from '@/lib/db';

// Define the schema for the request body
const updateMarketplaceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
});

export async function PATCH(
  request: Request,
  { params }: { params: { marketplaceId: string } }
) {
  try {
    // Get the authorization header
    const headersList = await headers();
    const { userId } = await verifyUserToken(headersList);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validation = updateMarketplaceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const { title } = validation.data;
    const { marketplaceId } = params;

    // Verify the marketplace exists and get its experience ID
    const marketplace = await prisma.marketplace.findUnique({
      where: { id: marketplaceId, deletedAt: null },
      select: { experienceId: true, active: true }
    });

    if (!marketplace) {
      return NextResponse.json(
        { error: 'Marketplace not found' },
        { status: 404 }
      );
    }

    // Check if user is an admin of the experience
    const accessCheck = await whopApi.checkIfUserHasAccessToExperience({
      userId,
      experienceId: marketplace.experienceId,
    });

    if (!accessCheck.hasAccessToExperience || 
        accessCheck.hasAccessToExperience.accessLevel !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Update the marketplace
    const updatedMarketplace = await prisma.marketplace.update({
      where: { id: marketplaceId },
      data: { 
        title,
        updatedAt: new Date() 
      },
      select: {
        id: true,
        title: true,
        takeRate: true,
        active: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedMarketplace);

  } catch (error) {
    console.error('Error updating marketplace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}