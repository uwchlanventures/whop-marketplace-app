import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import CreateMarketplaceItem from '@/components/create-marketplace-item';

export const dynamic = 'force-dynamic';

export default async function CreateItemPage({
  params,
}: {
  params: { experienceId: string; marketplaceId: string };
}) {
  try {
    // Verify the marketplace exists and is active
    const marketplace = await prisma.marketplace.findUnique({
      where: {
        id: params.marketplaceId
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
