"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CreateMarketplace from '@/components/create-marketplace';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateMarketplacePage({
  params,
}: {
  params: { experienceId: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    // Navigate back to the experience page on success
    router.push(`/experiences/${params.experienceId}`);
    // Optional: Add a toast notification here if you have one
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
          className="mb-4"
          onClick={handleCancel}
        >
          <Link href={`/experiences/${params.experienceId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experience
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">Create New Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new marketplace for your experience
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error creating marketplace
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg">
        <CreateMarketplace 
          experienceId={params.experienceId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
