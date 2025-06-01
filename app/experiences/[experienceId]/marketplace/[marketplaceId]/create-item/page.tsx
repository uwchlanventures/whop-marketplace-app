'use client';

import { notFound } from 'next/navigation';
// import { headers } from 'next/headers';
// import { whopApi } from '@/lib/whop-api';
// import { verifyUserToken } from '@whop/api';
import { prisma } from '@/lib/db';
import CreateMarketplaceItem from '@/components/create-marketplace-item';

export const dynamic = 'force-dynamic';

export default async function CreateItemPage({
  params,
}: {
  params: { experienceId: string; marketplaceId: string };
}) {
  try {
   //  // Get user token from headers
   //  const headersList = await headers();
   //  const { userId } = await verifyUserToken(headersList);
    
   //  // Check if user has access to the experience
   //  const result = await whopApi.checkIfUserHasAccessToExperience({
   //    userId,
   //    experienceId: params.experienceId,
   //  });

   //  if (!result.hasAccessToExperience) {
   //    return notFound();
   //  }

    // Verify the marketplace exists and is active
    const marketplace = await prisma.marketplace.findUnique({
      where: {
        id: params.marketplaceId,
        experienceId: params.experienceId,
        active: true,
        deletedAt: null,
      },
    });

    if (!marketplace) {
      return notFound();
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <CreateMarketplaceItem 
            marketplaceId={params.marketplaceId}
            experienceId={params.experienceId}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in create item page:', error);
    return notFound();
  }
}
