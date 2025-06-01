import { notFound } from 'next/navigation';
import MarketplaceItemDetail from '@/components/marketplace-item-detail';
import { headers } from 'next/headers';
import { verifyUserToken } from '@whop/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    experienceId: string;
    marketplaceId: string;
    marketplaceItemId: string;
  };
}

export default async function MarketplaceItemPage({ params }: PageProps) {
  const { experienceId, marketplaceId, marketplaceItemId } = params;
  
  try {
    // Get user's access level
    let accessLevel: 'admin' | 'customer' | 'no_access' = 'no_access';
    
    try {
      const headersList = await headers();
      const authHeader = headersList.get('authorization');
      
      if (authHeader) {
        const { userId } = await verifyUserToken(headersList);
        // In a real app, you would check the user's role/access level here
        // For now, we'll assume all authenticated users are customers
        accessLevel = 'customer';
        
        // Optional: Check if user is an admin
        // const isAdmin = await checkIfUserIsAdmin(userId);
        // if (isAdmin) accessLevel = 'admin';
      }
    } catch (error) {
      console.log('User not authenticated or token invalid, showing item in read-only mode');
    }

    // Fetch the marketplace item
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/marketplaces/${marketplaceId}/items/${marketplaceItemId}`,
      { 
        next: { revalidate: 60 }, // Revalidate every 60 seconds
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('Failed to fetch marketplace item');
    }

    const { item } = await response.json();

    return (
      <MarketplaceItemDetail 
        item={item}
        experienceId={experienceId}
        marketplaceId={marketplaceId}
        accessLevel={accessLevel}
      />
    );
  } catch (error) {
    console.error('Error in marketplace item page:', error);
    throw error; // This will be caught by the Next.js error boundary
  }
}
