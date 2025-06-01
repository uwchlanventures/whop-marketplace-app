'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface EditMarketplaceProps {
  marketplace: {
    id: string;
    title: string;
    experienceId: string;
  };
  accessLevel: 'admin' | 'customer' | 'no_access';
}

export default function EditMarketplace({ marketplace, accessLevel }: EditMarketplaceProps) {
  const router = useRouter();
  const [title, setTitle] = useState(marketplace.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only allow admin to edit
  const isAdmin = accessLevel === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      toast.error('You do not have permission to edit this marketplace');
      router.push(`/experiences/${marketplace.experienceId}/marketplace/${marketplace.id}`);
    }
  }, [isAdmin, marketplace.experienceId, marketplace.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) return;
    
    if (!title.trim()) {
      toast.error('Marketplace name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/marketplaces/${marketplace.id}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update marketplace');
      }
      
      const updatedMarketplace = await response.json();
      toast.success('Marketplace updated successfully');
      
      // Redirect back to the marketplace page
      router.push(`/experiences/${marketplace.experienceId}/marketplace/${marketplace.id}`);
      router.refresh();
    } catch (err) {
      console.error('Error updating marketplace:', err);
      setError(err instanceof Error ? err.message : 'Failed to update marketplace');
      toast.error('Failed to update marketplace');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/experiences/${marketplace.experienceId}/marketplace/${marketplace.id}`)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Button>
        <h1 className="text-2xl font-bold">Edit Marketplace</h1>
        <p className="text-gray-600 mt-1">
          Update your marketplace details below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Marketplace Name</Label>
          <Input
            id="title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Enter marketplace name"
            className="max-w-md"
            required
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-500">
            The name will be displayed to users browsing your marketplace.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center space-x-4 pt-4">
          <Button type="submit" disabled={isSubmitting || !isAdmin}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/experiences/${marketplace.experienceId}/marketplace/${marketplace.id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}