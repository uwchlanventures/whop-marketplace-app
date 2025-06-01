'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceItemDetailProps {
  item: {
    id: string;
    title: string;
    description: string;
    priceInCents: number;
    postedBy: string;
    imageUrl?: string | null;
    createdAt: string;
  };
  experienceId: string;
  marketplaceId: string;
  accessLevel: 'admin' | 'customer' | 'no_access';
}

export default function MarketplaceItemDetail({ 
  item, 
  experienceId, 
  marketplaceId,
  accessLevel 
}: MarketplaceItemDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = accessLevel === 'admin';

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}/items/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      toast.success('Item deleted successfully');
      router.push(`/experiences/${experienceId}/marketplace/${marketplaceId}`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/experiences/${experienceId}/marketplace/${marketplaceId}`)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Button>
        
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <div className="text-2xl font-semibold text-gray-900">
            {formatPrice(item.priceInCents)}
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          Posted on {formatDate(item.createdAt)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {item.imageUrl && (
          <div className="h-96 bg-gray-100 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{item.description}</p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Seller Information</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>Posted by: {item.postedBy}</p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-200 flex space-x-4">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Item'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
