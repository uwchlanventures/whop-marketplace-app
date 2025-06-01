"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';
import type { AccessLevel } from '@whop/api';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  priceInCents: number;
  postedBy: string;
  imageUrl?: string | null;
  createdAt: string;
}

interface Marketplace {
  id: string;
  title: string;
  description?: string;
  takeRate: number;
  experienceId: string;
}

interface MarketplaceHomeProps {
  marketplace: Marketplace;
  accessLevel: AccessLevel;
  experienceId: string;
}

export default function MarketplaceHome({ 
  marketplace, 
  accessLevel,
  experienceId 
}: MarketplaceHomeProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/marketplaces/${marketplace.id}/items`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch marketplace items');
        }
        
        const data = await response.json();
        setItems(data.items);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [marketplace.id]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading marketplace items: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{marketplace.title}</h1>
          {marketplace.description && (
            <p className="mt-2 text-gray-600">{marketplace.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Take rate: {marketplace.takeRate}%
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Link 
            href={`/experiences/${experienceId}/marketplace/${marketplace.id}/items/create`}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
          
          {accessLevel === 'admin' && (
            <Link 
              href={`/experiences/${experienceId}/marketplace/${marketplace.id}/edit`}
            >
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Marketplace
              </Button>
            </Link>
          )}
          
          {accessLevel === 'admin' && (
            <Link 
              href={`/experiences/${experienceId}/marketplace/${marketplace.id}/edit`}
            >
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Marketplace
              </Button>
            </Link>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first item to this marketplace.
          </p>
          <div className="mt-6">
            <Link 
              href={`/experiences/${experienceId}/marketplace/${marketplace.id}/items/create`}
            >
              <Button>
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Item
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              {item.imageUrl && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(item.priceInCents)}
                  </span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
