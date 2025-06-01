import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { whopApi } from '@/lib/whop-api';
import { verifyUserToken } from '@whop/api';
import { prisma } from '@/lib/db';
import MarketplaceHome from '@/components/marketplace-home';

// Add type for the access level
type AccessLevel = 'admin' | 'customer' | 'no_access';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage({
  params,
}: {
  params: { experienceId: string; marketplaceId: string };
}) {
  try {
    // The headers contain the user token
    const headersList = await headers();

    // The user token is in the headers
    const { userId } = await verifyUserToken(headersList);
    
    // Check if user has access to the experience
    const result = await whopApi.checkIfUserHasAccessToExperience({
      userId,
      experienceId: params.experienceId,
    });

    if (!result.hasAccessToExperience) {
      return notFound();
    }

    // Extract access level from the result
    const accessLevel = result.hasAccessToExperience.accessLevel as AccessLevel;

    // Fetch marketplace details
    const marketplace = await prisma.marketplace.findUnique({
      where: {
        id: params.marketplaceId,
        experienceId: params.experienceId,
        active: true,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        takeRate: true,
        experienceId: true,
      },
    });

    if (!marketplace) {
      return notFound();
    }

    return (
      <MarketplaceHome
        marketplace={{
          ...marketplace,
          description: '', // Add empty description since it's required by the type but not in our schema
        }}
        accessLevel={accessLevel}
        experienceId={params.experienceId}
      />
    );
  } catch (error) {
    console.error('Error in marketplace page:', error);
    return notFound();
  }
}
